import { describe, expect, it } from "vitest";
import { credentialsSignInSucceeded, safeReturnTo } from "./auth-result";

describe("credential sign-in result handling", () => {
  it("requires an explicit successful Auth.js response", () => {
    expect(credentialsSignInSucceeded({ ok: true })).toBe(true);
    expect(credentialsSignInSucceeded({ ok: true, error: "CredentialsSignin" })).toBe(false);
    expect(credentialsSignInSucceeded({ ok: false })).toBe(false);
    expect(credentialsSignInSucceeded(undefined)).toBe(false);
  });

  it("accepts same-origin return paths and rejects external redirects", () => {
    expect(safeReturnTo("/knowledge/new", "/profile")).toBe("/knowledge/new");
    expect(safeReturnTo("//evil.example", "/profile")).toBe("/profile");
    expect(safeReturnTo("https://evil.example", "/profile")).toBe("/profile");
    expect(safeReturnTo(null, "/profile")).toBe("/profile");
  });
});
