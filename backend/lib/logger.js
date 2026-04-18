import pino from "pino";
import { readRuntimeValue } from "./runtime-values.js";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  base: {
    service: "taskline-backend",
    version: readRuntimeValue("APP_VERSION", process.env.APP_VERSION || "unknown"),
    env: process.env.NODE_ENV || "development",
  },
});

export default logger;
