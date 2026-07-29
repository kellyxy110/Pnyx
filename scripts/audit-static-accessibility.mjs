import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [
  ["skip link", read("src/components/product-nav.tsx").includes('href="#main-content"')],
  ["main landmark id", ["ai", "explore", "feed", "knowledge", "spaces"].every((name) => read(`src/app/${name}/page.tsx`).includes('id="main-content"'))],
  ["visible focus styles", read("src/app/globals.css").includes(":focus-visible")],
  ["reduced motion support", read("src/app/globals.css").includes("prefers-reduced-motion")],
  ["auth labels", read("src/components/auth-form.tsx").includes("<label")],
  ["status/error semantics", read("src/components/auth-form.tsx").includes('role="alert"') && read("src/components/auth-form.tsx").includes('role="status"')],
  ["brand mark asset", fs.existsSync(path.join(root, "public/brand/pnyx-mark.svg"))],
  ["web manifest", fs.existsSync(path.join(root, "public/site.webmanifest"))],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
console.log(`Static checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;

