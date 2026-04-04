import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 3000);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8" };

const appConfig = () => {
  const cfg = {
    appTitle: process.env.APP_TITLE || "Taskline",
  };
  return `window.__APP_CONFIG__=${JSON.stringify(cfg)};`;
};

createServer(async (req, res) => {
  const start = Date.now();
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);

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
