import { afterEach, describe, expect, it } from "vitest";
import { isEmailSignupEnabled } from "./auth-feature-flags";

describe("email signup feature flag", () => {
  const previous = process.env.EMAIL_SIGNUP_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.EMAIL_SIGNUP_ENABLED;
    else process.env.EMAIL_SIGNUP_ENABLED = previous;
  });

  it("keeps email signup disabled unless explicitly enabled", () => {
    delete process.env.EMAIL_SIGNUP_ENABLED;
    expect(isEmailSignupEnabled()).toBe(false);
  });

  it("restores email signup when explicitly enabled", () => {
    process.env.EMAIL_SIGNUP_ENABLED = "true";
    expect(isEmailSignupEnabled()).toBe(true);
  });
});

