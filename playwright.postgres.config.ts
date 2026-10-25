import { defineConfig } from "@playwright/test";
import { verificationTarget } from "./tests/postgres/target";

const { app } = verificationTarget(process.env);
export default defineConfig({
  testDir: "./tests/postgres",
  testMatch: "**/*.spec.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 45_000,
  reporter: [["list"], ["json", { outputFile: "artifacts/postgres-results.json" }]],
  use: { baseURL: app.origin, trace: "off" },
});
