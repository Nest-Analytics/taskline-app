import { readFileSync } from "node:fs";

export const readRuntimeValue = (envVar, fallback = "") => {
  if (process.env[envVar]) return process.env[envVar];
  try {
    return readFileSync(`/etc/secrets/${envVar}`, "utf8").trim();
  } catch {
    return fallback;
  }
};
