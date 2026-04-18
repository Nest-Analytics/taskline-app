import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean)
  .filter((file) => existsSync(file));
const forbidden = [".env", ".env.example"].filter((f) => tracked.includes(f));
if (forbidden.length) fail(`Tracked env files are not allowed: ${forbidden.join(", ")}`);

const files = tracked.filter((f) => /\.(js|jsx|json|ya?ml)$/.test(f));
for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (text.includes("\t")) fail(`Tabs are not allowed: ${file}`);
}

const critical = tracked.filter((f) =>
  /^(frontend\/src\/|backend\/server\.js|backend\/lib\/|backend\/prisma\/)/.test(f),
);
for (const file of critical) {
  const lines = readFileSync(file, "utf8").split("\n").length;
  if (lines > 100) fail(`File exceeds 100 lines: ${file} (${lines})`);
}

console.log("Lint checks passed.");
