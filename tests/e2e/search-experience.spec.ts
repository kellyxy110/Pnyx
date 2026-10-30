import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const empty = { posts: [], replies: [], artifacts: [], spaces: [], people: [] };

test("header query opens an immediate search and clear returns focus", async ({ page, isMobile }) => {
  const queries: string[] = [];
  await page.route("**/api/search?*", route => {
    queries.push(new URL(route.request().url()).searchParams.get("q") ?? "");
    return route.fulfill({ json: { results: empty } });
  });
  await page.goto("/explore");
  if (!isMobile) {
    await page.getByRole("searchbox", { name: "Search Pnyx", exact: true }).fill("server components");
    await page.getByRole("button", { name: "Submit search", exact: true }).click();
  } else {
    await page.goto("/explore?q=server%20components");
  }
  const query = page.getByRole("searchbox", { name: "What are you curious about?" });
  await expect(query).toHaveValue("server components");
  await expect(page.getByRole("heading", { name: "No matches this time." })).toBeVisible();
  expect(queries).toContain("server components");
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(query).toHaveValue("");
  await expect(query).toBeFocused();
});

test("network failure releases the search action and supports retry", async ({ page }) => {
  let fail = true;
  await page.route("**/api/search?*", route => fail ? route.abort("failed") : route.fulfill({ json: { results: empty } }));
  await page.goto("/explore");
  await page.getByRole("searchbox", { name: "What are you curious about?" }).fill("design systems");
  const submit = page.getByRole("button", { name: "Search", exact: true });
  await submit.click();
  await expect(page.locator('.search-error[role="alert"]')).toContainText("Check your connection");
  await expect(submit).toBeEnabled();
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No matches this time." })).toBeVisible();
  await expect(page.locator('.search-error[role="alert"]')).toHaveCount(0);
});

test("filters are keyboard accessible at every viewport, empty results can reset them", async ({ page }) => {
  const queries: URL[] = [];
  await page.route("**/api/search?*", route => {
    queries.push(new URL(route.request().url()));
    return route.fulfill({ json: { results: empty } });
  });
  await page.goto("/explore");
  const details = page.locator(".search-filters summary");
  await details.focus();
  await details.press("Enter");
  await page.getByLabel("Author username").fill("alex");
  await page.getByRole("searchbox", { name: "What are you curious about?" }).fill("React");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No matches this time." })).toBeVisible();
  expect(queries.at(-1)?.searchParams.get("author")).toBe("alex");
  await page.getByRole("button", { name: "Search without filters" }).click();
  await expect(page.getByLabel("Author username")).toHaveValue("");
  await expect.poll(() => queries.at(-1)?.searchParams.has("author")).toBe(false);
});

test("pagination keeps submitted criteria even while the next query is being edited", async ({ page }) => {
  const queries: URL[] = [];
  await page.route("**/api/search?*", route => {
    const url = new URL(route.request().url());
    queries.push(url);
    const second = url.searchParams.get("page") === "2";
    const people = Array.from({ length: second ? 1 : 10 }, (_, i) => ({ id: `${second ? "next" : "first"}-${i}`, displayName: `Person ${i}`, username: `person-${i}` }));
    return route.fulfill({ json: { results: { ...empty, people } } });
  });
  await page.goto("/explore");
  const query = page.getByRole("searchbox", { name: "What are you curious about?" });
  await query.fill("original query");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("button", { name: "Load more results" })).toBeVisible();
  await query.fill("different query");
  await page.getByRole("button", { name: "Load more results" }).click();
  await expect(page.locator(".search-feedback")).toContainText("11 results loaded");
  expect(queries.at(-1)?.searchParams.get("q")).toBe("original query");
  expect(queries.at(-1)?.searchParams.get("page")).toBe("2");
});

test("expanded search reflows and has no axe violations in either theme", async ({ page }) => {
  await page.goto("/explore");
  await page.locator(".search-filters summary").click();
  for (const dark of [false, true]) {
    if (dark) await page.getByRole("button", { name: "Use dark theme" }).click();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const query = page.getByRole("searchbox", { name: "What are you curious about?" });
    const geometry = await query.evaluate(element => ({ font: parseFloat(getComputedStyle(element).fontSize), height: element.getBoundingClientRect().height }));
    expect(geometry.font).toBeGreaterThanOrEqual(16);
    expect(geometry.height).toBeGreaterThanOrEqual(44);
  }
});

test("search and expanded filters fit narrow and breakpoint widths", async ({ page }) => {
  await page.goto("/explore");
  await page.locator(".search-filters summary").click();
  for (const width of [320, 360, 760, 767, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel("Author username")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}px`).toBe(true);
  }
});

test("sign-in text fields have readable type and visible keyboard focus", async ({ page }) => {
  await page.goto("/sign-in");
  for (const field of [page.getByLabel("Email", { exact: true }), page.getByLabel("Password", { exact: true })]) {
    await field.focus();
    await expect(field).toBeFocused();
    const style = await field.evaluate(element => ({ font: parseFloat(getComputedStyle(element).fontSize), height: element.getBoundingClientRect().height, shadow: getComputedStyle(element).boxShadow }));
    expect(style.font).toBeGreaterThanOrEqual(16);
    expect(style.height).toBeGreaterThanOrEqual(44);
    expect(style.shadow).not.toBe("none");
  }
});
