import { describe, expect, it } from "vitest";
import { parseJson, recoveryEmailSchema, recoveryTokenSchema, resetPasswordSchema } from "./recovery-validation";

describe("account recovery payload validation", () => {
  it("rejects malformed and non-string email payloads", () => {
    expect(parseJson(null, recoveryEmailSchema)).toBeNull();
    expect(parseJson({ email: 42 }, recoveryEmailSchema)).toBeNull();
    expect(parseJson({ email: "not-an-email" }, recoveryEmailSchema)).toBeNull();
  });

  it("rejects malformed and non-string tokens before hashing", () => {
    expect(parseJson({ token: 42 }, recoveryTokenSchema)).toBeNull();
    expect(parseJson({ token: "short" }, recoveryTokenSchema)).toBeNull();
  });

  it("rejects malformed reset passwords", () => {
    expect(parseJson({ token: "a".repeat(32), password: 123456789012 }, resetPasswordSchema)).toBeNull();
    expect(parseJson({ token: "a".repeat(32), password: "short" }, resetPasswordSchema)).toBeNull();
    expect(parseJson({ token: "a".repeat(32), password: "long-enough-password" }, resetPasswordSchema)?.password).toBe("long-enough-password");
  });
});
