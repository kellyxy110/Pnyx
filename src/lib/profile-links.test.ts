import { describe, expect, it } from "vitest";
import { safeProfileLink } from "./profile-links";
describe("legacy profile link rendering", () => {
  it.each([null, "javascript:alert(1)", "data:text/html,unsafe", "https://user:password@example.test", "not a url"])("omits unsafe saved value %s", value => expect(safeProfileLink(value)).toBeNull());
  it("preserves normal public web links", () => {
    expect(safeProfileLink("https://example.test/notes")).toBe("https://example.test/notes");
    expect(safeProfileLink("http://example.test")).toBe("http://example.test/");
  });
});
