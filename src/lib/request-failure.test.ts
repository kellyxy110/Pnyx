import { describe, expect, it } from "vitest";
import { requestFailureMessage } from "./request-failure";

describe("request failure messaging", () => {
  it("uses a safe fallback for network failures", () => {
    expect(requestFailureMessage(new TypeError("Failed to fetch"), "Try again.")).toBe("Try again.");
  });
  it("preserves useful server errors", () => {
    expect(requestFailureMessage(new Error("Space could not be loaded."), "Try again.")).toBe("Space could not be loaded.");
  });
});
