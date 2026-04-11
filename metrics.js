import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register, prefix: "taskline_" });

const requestCounter = new client.Counter({
  name: "taskline_http_requests_total",
  help: "Total number of HTTP requests handled by Taskline",
  labelNames: ["method", "path", "status_code"],
  registers: [register],
});

const requestDurationHistogram = new client.Histogram({
  name: "taskline_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

const errorCounter = new client.Counter({
  name: "taskline_errors_total",
  help: "Total number of server-side errors",
  labelNames: ["method", "path", "type"],
  registers: [register],
});

const taskCreatedCounter = new client.Counter({
  name: "taskline_tasks_created_total",
  help: "Total number of tasks created through the demo API",
  registers: [register],
});

const normalizePath = (pathname) => {
  if (pathname.startsWith("/api/demo/tasks/") && pathname.endsWith("/status")) {
    return "/api/demo/tasks/:id/status";
  }
  return pathname;
};

const recordRequestMetrics = ({ method, path, statusCode, durationMs }) => {
  const labels = {
    method,
    path: normalizePath(path),
    status_code: String(statusCode),
  };
  requestCounter.inc(labels);
  requestDurationHistogram.observe(labels, durationMs / 1000);
};

const recordErrorMetric = ({ method, path, type = "server_error" }) => {
  errorCounter.inc({
    method,
    path: normalizePath(path),
    type,
  });
};

const recordTaskCreatedMetric = () => {
  taskCreatedCounter.inc();
};

const getMetricsResponse = async () => ({
  body: await register.metrics(),
  contentType: register.contentType,
});

export {
  getMetricsResponse,
  recordErrorMetric,
  recordRequestMetrics,
  recordTaskCreatedMetric,
};
