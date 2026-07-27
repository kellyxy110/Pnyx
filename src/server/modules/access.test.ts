import { describe, expect, it } from "vitest";
import { canRead } from "./access";

describe("visibility access", () => {
  it("allows public content without an account", () => expect(canRead("PUBLIC", "owner", {})).toBe(true));
  it("requires an authenticated follower for follower content", () => {
    expect(canRead("FOLLOWERS_ONLY", "owner", { userId: "reader", followsAuthor: false })).toBe(false);
    expect(canRead("FOLLOWERS_ONLY", "owner", { userId: "reader", followsAuthor: true })).toBe(true);
  });
  it("allows owners to read their private content", () => expect(canRead("PRIVATE", "owner", { userId: "owner" })).toBe(true));
});
