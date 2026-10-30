import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/sign-in", "/sign-up", "/explore", "/spaces", "/knowledge", "/ai"];

for (const route of routes) {
  test(`${route} is accessible and does not overflow`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeGreaterThanOrEqual(200);
    expect(response?.status()).toBeLessThan(400);
    await page.waitForTimeout(500);
    await expect(page.locator("main")).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, results.violations.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `${route} overflows its viewport`).toBe(false);
  });
}

test("sign-up form supports keyboard focus and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/sign-up", { waitUntil: "domcontentloaded" });

  const config = await page.request.get("/api/auth/config");
  const emailSignupEnabled = (await config.json()).emailSignupEnabled === true;
  if (emailSignupEnabled) {
    const firstField = page.getByLabel("Display name");
    await firstField.focus();
    await expect(firstField).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Username")).toBeFocused();
  } else {
    const providers = page.getByRole("button", { name: /Google|GitHub/ }).filter({ visible: true });
    const enabled = page.locator(".social-button:not(:disabled)").filter({ hasText: /Google|GitHub/ });
    if (await enabled.count()) {
      await enabled.first().focus();
      await expect(enabled.first()).toBeFocused();
    } else {
      // An isolated environment has no OAuth secrets: disabled providers cannot receive focus.
      const signIn = page.locator(".auth-switch").getByRole("link", { name: "Sign in", exact: true });
      await signIn.focus();
      await expect(signIn).toBeFocused();
      await expect(providers.first()).toBeDisabled();
    }
  }

  const motion = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return { reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, transition: style.getPropertyValue("transition-duration") };
  });
  expect(motion.reduced).toBe(true);
  expect(motion.transition).toBe("0s");
});
