import { chromium } from "playwright";

const baseURL = process.env.PNYX_AUDIT_URL ?? "https://pnyx-psi.vercel.app";
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const viewports = [
  ["mobile", { width: 390, height: 844 }],
  ["tablet", { width: 768, height: 1024 }],
  ["desktop", { width: 1440, height: 900 }],
  ["wide", { width: 1920, height: 1080 }],
];
const routes = ["/", "/sign-in", "/sign-up", "/spaces", "/explore", "/knowledge", "/ai"];
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const results = [];
for (const [viewportName, viewport] of viewports) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    try {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForTimeout(500);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        main: Boolean(document.querySelector("main")),
      }));
      results.push({ viewport: viewportName, route, status: response?.status() ?? 0, ...metrics });
    } catch (error) {
      results.push({ viewport: viewportName, route, status: 0, error: error instanceof Error ? error.message : String(error) });
    } finally {
      await page.close();
    }
  }
  await context.close();
}
await browser.close();
const failures = results.filter((item) => item.status >= 500 || item.status < 200 || item.overflow || !item.main || item.error);
console.log(JSON.stringify({ baseURL, total: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
