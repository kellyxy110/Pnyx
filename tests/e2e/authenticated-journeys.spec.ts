import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://pnyx-psi.vercel.app";
const canonicalProduction = "https://pnyx-psi.vercel.app";
const canRun = process.env.E2E_ALLOW_AUTHENTICATED === "true" && Boolean(email && password) && baseURL.replace(/\/$/, "") !== canonicalProduction;

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in to Pnyx" }).click();
  await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });
}

test.describe("controlled authenticated journeys", () => {
  test.skip(!canRun, "Requires E2E_ALLOW_AUTHENTICATED=true, dedicated test credentials, and a non-production PLAYWRIGHT_BASE_URL.");

  test("signs in, loads the persisted profile, and exposes the session menu", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Make your perspective findable." })).toBeVisible();
    await expect(page.getByRole("button", { name: /@/ })).toBeVisible();
    await page.getByRole("button", { name: /@/ }).click();
    await expect(page.getByRole("menuitem", { name: "View profile" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  });

  test("keeps an authenticated user on the real composer surface without publishing", async ({ page }) => {
    await signIn(page);
    await page.goto("/feed", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Share an idea, question, or useful finding" })).toBeVisible();
    await expect(page.getByLabel("Space")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Publish discussion" })).toBeVisible();
  });
});