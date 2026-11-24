import { describe, expect, it } from "vitest";
import { publicProfilePath } from "./profile-navigation";

describe("profile navigation", () => {
  it("builds a same-origin public profile path", () => {
    expect(publicProfilePath("kellyxy")).toBe("/people/kellyxy");
    expect(publicProfilePath("builder-name")).toBe("/people/builder-name");
  });
});
