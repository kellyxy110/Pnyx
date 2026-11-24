import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: process.env.E2E_ALLOW_AUTHENTICATED !== "true",
  workers: process.env.E2E_ALLOW_AUTHENTICATED === "true" ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "artifacts/playwright-report", open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    launchOptions: executablePath ? { executablePath } : undefined,
    trace: process.env.E2E_ALLOW_AUTHENTICATED === "true" ? "off" : "retain-on-failure",
    screenshot: process.env.E2E_ALLOW_AUTHENTICATED === "true" ? "off" : "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "tablet", use: { ...devices["iPad Mini"], browserName: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], browserName: "chromium" } },
  ],
});