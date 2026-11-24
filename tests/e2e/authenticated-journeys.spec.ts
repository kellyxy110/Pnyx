import { authenticatedVerificationTarget } from "../../src/lib/disposable-verification";
import { assertVerifiedApplication } from "../support/verified-application";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const target = authenticatedVerificationTarget(process.env);
const canRun = Boolean(target);

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Sign in to Pnyx" }).click();
  await expect(page).toHaveURL(/\/profile/, { timeout: 15_000 });
}

test.describe("controlled authenticated journeys", () => {
  test.skip(!canRun, "Requires positively verified disposable app/database and synthetic credentials.");
  test.beforeAll(async ({ request }) => { if (canRun) await assertVerifiedApplication(request); });

  test("signs in, loads the persisted profile, and exposes the session menu", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("heading", { name: "Your technology identity, in one place." })).toBeVisible();
    const accountMenu = page.locator('button[aria-haspopup="menu"]');
    await expect(accountMenu).toBeVisible();
    await accountMenu.click();
    await expect(page.getByRole("menuitem", { name: "View profile" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  });

  test("keeps an authenticated user on the real composer surface without publishing", async ({ page }) => {
    await signIn(page);
    await page.goto("/feed", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Share an idea, question, or useful finding" })).toBeVisible();
    await expect(page.getByLabel("Space")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Publish discussion" })).toBeVisible();
    const writingWidth = await page.locator(".community-layout").evaluate(element => {
      const editor = element.querySelector(".composer")!.getBoundingClientRect();
      return editor.width / element.getBoundingClientRect().width;
    });
    expect(writingWidth).toBeGreaterThan(.94);
    const offset = await page.locator(".composer-fields").evaluate(element => {
      if (getComputedStyle(element).gridTemplateColumns.split(" ").length < 2) return 0;
      const fields = element.querySelectorAll("select");
      return Math.abs(fields[0].getBoundingClientRect().top - fields[1].getBoundingClientRect().top);
    });
    expect(offset).toBeLessThan(2);
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
    const membership = page.getByRole("button", { name: /^(Join|Leave) Space$/ }).first();
    const initialLabel = await membership.innerText();
    const changedLabel = initialLabel === "Join Space" ? "Leave Space" : "Join Space";
    await membership.click();
    await expect(membership).toHaveText(changedLabel);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(membership).toHaveText(changedLabel);
    await membership.click();
    await expect(membership).toHaveText(initialLabel);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(membership).toHaveText(initialLabel);
  });

  test("dark profile and editing fields remain readable", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Use dark theme" }).click();
    await expect(page.getByRole("button", { name: /Account menu for/ })).toBeVisible();
    let scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations, JSON.stringify(scan.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))).toEqual([]);
    const ratios = await page.locator(".product-avatar-fallback, .profile-avatar-fallback").evaluateAll(elements => {
      function luminance(color: string) {
        const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      }
      return elements.map(element => { const style = getComputedStyle(element); const a = luminance(style.color); const b = luminance(style.backgroundColor); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); });
    });
    expect(ratios.length).toBeGreaterThan(0);
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    await page.getByRole("button", { name: "Edit profile", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Bio", exact: true })).toBeVisible();
    scan = await new AxeBuilder({ page }).analyze();
    expect(scan.violations, JSON.stringify(scan.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))).toEqual([]);
  });

});
