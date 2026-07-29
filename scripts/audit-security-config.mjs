import fs from "node:fs";

const config = fs.readFileSync("next.config.ts", "utf8");
const required = [
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
];
const missing = required.filter((header) => !config.includes(header));
for (const header of required) console.log(`${missing.includes(header) ? "FAIL" : "PASS"} ${header}`);
console.log(`Security header checks: ${required.length - missing.length}/${required.length} passed`);
if (missing.length) process.exitCode = 1;

