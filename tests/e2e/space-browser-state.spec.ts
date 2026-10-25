import { expect, test } from "@playwright/test";

test.describe("Space browser server-response synchronization", () => {
  test("unfollowing updates the Following filter and survives a reload", async ({ page }) => {
    let following = true;
    let followers = 8;
    await page.route("**/api/spaces", (route) => route.fulfill({ json: [{
      id: "test-space", slug: "test-space", name: "Test Space", description: "Controlled browser fixture",
      tags: [], isFeatured: false, viewer: { joined: false, following, isModerator: false },
      _count: { members: 4, followers },
    }] }));
    await page.route("**/api/spaces/test-space/follow", (route) => {
      following = route.request().method() === "POST";
      followers = following ? 8 : 7;
      return route.fulfill({ json: { following, followers } });
    });
    await page.goto("/spaces");
    await page.getByRole("tab", { name: "Following", exact: true }).click();
    const card = page.getByRole("article").filter({ hasText: "Test Space" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Following", exact: true }).click();
    await expect(card).toHaveCount(0);
    await page.getByRole("tab", { name: "All Spaces" }).click();
    await expect(card).toContainText("4 members · 7 followers");
    await page.reload();
    await expect(card.getByRole("button", { name: "Follow", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Following", exact: true }).click();
    await expect(card).toHaveCount(0);
  });

  for (const moderator of [false, true]) {
    test(`Leave respects persisted ${moderator ? "moderator" : "ordinary member"} state`, async ({ page }) => {
      await page.route("**/api/spaces", (route) => route.fulfill({ json: [{
        id: "test-space", slug: "test-space", name: "Test Space", description: "Controlled browser fixture",
        tags: [], isFeatured: false, viewer: { joined: true, following: false, isModerator: moderator },
        _count: { members: 4, followers: 8 },
      }] }));
      await page.route("**/api/spaces/test-space/membership", (route) => {
        expect(route.request().method()).toBe("DELETE");
        return route.fulfill({ json: { joined: moderator, members: moderator ? 4 : 3 } });
      });
      await page.goto("/spaces");
      await page.getByRole("tab", { name: "Joined", exact: true }).click();
      const card = page.getByRole("article").filter({ hasText: "Test Space" });
      await card.getByRole("button", { name: "Leave", exact: true }).click();
      if (moderator) {
        await expect(card.getByRole("button", { name: "Leave", exact: true })).toBeEnabled();
        await expect(page).toHaveURL(/\/spaces$/);
        await expect(card).toContainText("4 members");
      } else {
        await expect(card).toHaveCount(0);
        await page.getByRole("tab", { name: "All Spaces" }).click();
        await expect(card).toContainText("3 members");
        await expect(card.getByRole("button", { name: "Join", exact: true })).toBeVisible();
      }
    });
  }

  test("failed actions leave filters and counts unchanged", async ({ page }) => {
    await page.route("**/api/spaces", (route) => route.fulfill({ json: [{
      id: "test-space", slug: "test-space", name: "Test Space", description: "Controlled browser fixture",
      tags: [], isFeatured: false, viewer: { joined: true, following: true, isModerator: false },
      _count: { members: 4, followers: 8 },
    }] }));
    await page.route("**/api/spaces/test-space/follow", (route) => route.fulfill({ status: 503, json: { error: "Try again later." } }));
    await page.goto("/spaces");
    await page.getByRole("tab", { name: "Following", exact: true }).click();
    const card = page.getByRole("article").filter({ hasText: "Test Space" });
    await card.getByRole("button", { name: "Following", exact: true }).click();
    await expect(card.getByRole("alert")).toHaveText("Try again later.");
    await expect(card).toContainText("4 members · 8 followers");
    await expect(card.getByRole("button", { name: "Following", exact: true })).toBeEnabled();
  });
});
