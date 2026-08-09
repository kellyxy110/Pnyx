import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://pnyx-psi.vercel.app";
const canonicalProduction = "https://pnyx-psi.vercel.app";
const canRun = process.env.E2E_ALLOW_AUTHENTICATED === "true" && Boolean(email && password) && baseURL.replace(/\/$/, "") !== canonicalProduction;
const storageCanRun = canRun && process.env.E2E_STORAGE_ENABLED === "true";

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

  test("preserves Space context in the composer", async ({ page }) => {
    await signIn(page);
    await page.goto("/feed?space=web&returnTo=%2Fspaces%2Fweb#composer", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Space")).toHaveValue("web");
    await expect(page.getByText(/Posting in Web3/)).toBeVisible();
    await expect(page.getByText(/published in Web3/)).toBeVisible();
  });

  test("edits and reloads the persisted profile", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Edit profile" }).click();
    const headline = page.getByLabel("Headline");
    await headline.fill("Builder in the Pnyx controlled beta");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("Profile saved.");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Builder in the Pnyx controlled beta")).toBeVisible();
  });

  test("joins and leaves a Space with a persisted membership action", async ({ page }) => {
    await signIn(page);
    await page.goto("/spaces/web", { waitUntil: "domcontentloaded" });
    const membership = page.getByRole("button", { name: /^(Join|Leave)$/ }).first();
    const initialLabel = await membership.innerText();
    await membership.click();
    await expect(membership).toHaveText(initialLabel === "Join" ? "Leave" : "Join");
    await membership.click();
    await expect(membership).toHaveText(initialLabel);
  });

  test("uploads and removes profile media when the isolated storage provider is enabled", async ({ page }) => {
    test.skip(!storageCanRun, "Requires isolated R2 storage and E2E_STORAGE_ENABLED=true.");
    await signIn(page);
    await page.getByRole("button", { name: "Edit profile" }).click();
    const avatar = page.locator('input[type="file"]').first();
    await avatar.setInputFiles("public/images/pnyx-community-collage.png");
    await expect(page.getByRole("status")).toContainText("Avatar updated.", { timeout: 15_000 });
    await page.getByRole("button", { name: "Remove avatar" }).click();
    await expect(page.getByRole("status")).toContainText("Avatar removed.", { timeout: 15_000 });
  });
});
