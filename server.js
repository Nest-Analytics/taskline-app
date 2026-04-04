import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8" };



const readRuntimeValue = (envVar, fallback = "") => {
  if (process.env[envVar]) return process.env[envVar];
  try {
    return readFileSync(`/etc/secrets/${envVar}`, "utf8").trim();
  } catch {
    return fallback;
  }
};

const APP_TITLE = readRuntimeValue("APP_TITLE", "Taskline");
const APP_USERNAME = readRuntimeValue("APP_USERNAME");
const APP_PASSWORD = readRuntimeValue("APP_PASSWORD");
const PORT = Number(readRuntimeValue("PORT", "3000"));

// In-memory session store — maps token → username
const sessions = new Map();

const parseCookies = (header = "") =>
  Object.fromEntries(header.split(";").map((c) => c.trim().split("=").map(decodeURIComponent)));

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

const appConfig = () => {
  const cfg = {
    appTitle: APP_TITLE,
  };
  return `window.__APP_CONFIG__=${JSON.stringify(cfg)};`;
};

createServer(async (req, res) => {
  const start = Date.now();
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const cookies = parseCookies(req.headers.cookie);

  // POST /login — validate credentials from env vars
  if (url.pathname === "/login" && req.method === "POST") {
    const body = await readBody(req);
    const { username, password } = JSON.parse(body || "{}");
    if (username === APP_USERNAME && password === APP_PASSWORD) {
      const token = randomUUID();
      sessions.set(token, username);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `session=${token}; HttpOnly; SameSite=Strict; Path=/`,
      });
      res.end(JSON.stringify({ ok: true }));
      logger.info({ username, status: 200 }, "login success");
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Invalid credentials" }));
      logger.warn({ username, status: 401 }, "login failed");
    }
    return;
  }

  // POST /logout — clear session
  if (url.pathname === "/logout" && req.method === "POST") {
    sessions.delete(cookies.session);
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // GET /api/me — check if session is valid
  if (url.pathname === "/api/me") {
    const username = sessions.get(cookies.session);
    if (username) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, username }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false }));
    }
    return;
  }

  if (url.pathname === "/app-config.js") {
    res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", Pragma: "no-cache", Expires: "0" });
    res.end(appConfig());
    logger.info({ method: req.method, path: url.pathname, status: 200, duration_ms: Date.now() - start }, "request completed");
    return;
  }

  const filePath = path.join(DIST_DIR, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
  try {
    const body = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(body);
    logger.info({ method: req.method, path: url.pathname, status: 200, duration_ms: Date.now() - start }, "request completed");
  } catch {
    try {
      const index = await readFile(path.join(DIST_DIR, "index.html"));
      res.writeHead(200, { "Content-Type": MIME[".html"] });
      res.end(index);
      logger.info({ method: req.method, path: url.pathname, status: 200, duration_ms: Date.now() - start }, "request completed");
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Build output missing: dist/index.html");
      logger.error({ method: req.method, path: url.pathname, status: 500, duration_ms: Date.now() - start }, "dist/index.html missing");
    }
  }
}).listen(PORT, "0.0.0.0", () => {
  logger.info({ port: PORT }, "Taskline server started");
});
