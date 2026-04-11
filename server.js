import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import "./appinsights.js";
import logger from "./logger.js";
import {
  getMetricsResponse,
  recordErrorMetric,
  recordRequestMetrics,
  recordTaskCreatedMetric,
} from "./metrics.js";
import { readRuntimeValue } from "./runtime-values.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8" };



const PORT = Number(readRuntimeValue("PORT", "3000"));

// In-memory session store — maps token → username
const sessions = new Map();
const demoTasks = new Map();

const parseCookies = (header = "") =>
  Object.fromEntries(header.split(";").map((c) => c.trim().split("=").map(decodeURIComponent)));

const attachRequestLogging = (req, res, pathname) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    recordRequestMetrics({
      method: req.method,
      path: pathname,
      statusCode: res.statusCode,
      durationMs,
    });
    if (res.statusCode >= 500) {
      recordErrorMetric({ method: req.method, path: pathname, type: "http_5xx" });
    }
    logger.info({
      method: req.method,
      path: pathname,
      status: res.statusCode,
      duration_ms: durationMs,
    }, "request completed");
  });
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

const sendJson = (res, statusCode, body, headers = {}) => {
  res.writeHead(statusCode, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};

const sendText = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
};

const parseJsonBody = async (req) => {
  const body = await readBody(req);
  return JSON.parse(body || "{}");
};

const appConfig = () => {
  const cfg = {
    appTitle: readRuntimeValue("APP_TITLE", "Taskline"),
  };
  return `window.__APP_CONFIG__=${JSON.stringify(cfg)};`;
};

createServer(async (req, res) => {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const cookies = parseCookies(req.headers.cookie);
  attachRequestLogging(req, res, url.pathname);

  try {
    // POST /login — validate credentials from env vars
    if (url.pathname === "/login" && req.method === "POST") {
      const { username, password } = await parseJsonBody(req);
      const validUsername = readRuntimeValue("APP_USERNAME");
      const validPassword = readRuntimeValue("APP_PASSWORD");
      if (username === validUsername && password === validPassword) {
        const token = randomUUID();
        sessions.set(token, username);
        sendJson(res, 200, { ok: true }, {
          "Set-Cookie": `session=${token}; HttpOnly; SameSite=Strict; Path=/`,
        });
        logger.info({ username, status: 200 }, "login success");
      } else {
        sendJson(res, 401, { ok: false, error: "Invalid credentials" });
        logger.warn({ username, status: 401 }, "login failed");
      }
      return;
    }

    // POST /logout — clear session
    if (url.pathname === "/logout" && req.method === "POST") {
      const username = sessions.get(cookies.session);
      sessions.delete(cookies.session);
      sendJson(res, 200, { ok: true }, {
        "Set-Cookie": "session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
      });
      logger.info({ username, status: 200 }, "logout success");
      return;
    }

    // GET /api/me — check if session is valid
    if (url.pathname === "/api/me") {
      const username = sessions.get(cookies.session);
      if (username) {
        sendJson(res, 200, { ok: true, username });
      } else {
        sendJson(res, 401, { ok: false });
      }
      return;
    }

    if (url.pathname === "/metrics") {
      const { body, contentType } = await getMetricsResponse();
      res.writeHead(200, { "Content-Type": contentType });
      res.end(body);
      return;
    }

    // Demo-only endpoints for monitoring lessons
    if (url.pathname === "/api/demo/tasks" && req.method === "POST") {
      const { title = "" } = await parseJsonBody(req);
      if (!title.trim()) {
        sendJson(res, 400, { error: "title is required" });
        return;
      }
      const task = { id: `t_${randomUUID().slice(0, 8)}`, title: title.trim(), status: "open" };
      demoTasks.set(task.id, task);
      recordTaskCreatedMetric();
      logger.info({ task_id: task.id, title: task.title }, "task created");
      sendJson(res, 201, task);
      return;
    }

    if (url.pathname.startsWith("/api/demo/tasks/") && url.pathname.endsWith("/status") && req.method === "PATCH") {
      const taskId = url.pathname.split("/")[4];
      const task = demoTasks.get(taskId);
      if (!task) {
        sendJson(res, 404, { error: "task not found" });
        return;
      }
      const { status = "" } = await parseJsonBody(req);
      const nextStatus = status.trim();
      if (!nextStatus) {
        sendJson(res, 400, { error: "status is required" });
        return;
      }
      const previous = task.status;
      task.status = nextStatus;
      logger.info({
        task_id: task.id,
        previous_status: previous,
        new_status: nextStatus,
      }, "task status changed");
      sendJson(res, 200, { id: task.id, status: task.status });
      return;
    }

    if (url.pathname === "/api/demo/error") {
      throw new Error("Demo monitoring error");
    }

    if (url.pathname === "/app-config.js") {
      res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", Pragma: "no-cache", Expires: "0" });
      res.end(appConfig());
      return;
    }

    const filePath = path.join(DIST_DIR, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    try {
      const body = await readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(body);
    } catch {
      try {
        const index = await readFile(path.join(DIST_DIR, "index.html"));
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(index);
      } catch {
        sendText(res, 500, "Build output missing: dist/index.html");
        logger.error({ path: url.pathname }, "dist/index.html missing");
      }
    }
  } catch (err) {
    recordErrorMetric({ method: req.method, path: url.pathname, type: "unhandled_exception" });
    logger.error({
      err: { message: err.message, stack: err.stack },
      method: req.method,
      path: url.pathname,
    }, "unhandled error");
    sendJson(res, 500, { error: "Internal server error" });
  }
}).listen(PORT, "0.0.0.0", () => {
  logger.info({ port: PORT }, "Taskline server started");
});
