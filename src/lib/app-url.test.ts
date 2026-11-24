import { describe, expect, it } from "vitest";
import { accountActionUrl, configuredAppUrl } from "./app-url";

describe("configured account action URLs", () => {
  it("uses the explicit deployment origin without a trailing slash", () => {
    expect(configuredAppUrl("https://pnyx-psi.vercel.app/")).toBe("https://pnyx-psi.vercel.app");
    expect(accountActionUrl("verify-email?token=redacted", "https://pnyx-psi.vercel.app/")).toBe("https://pnyx-psi.vercel.app/verify-email?token=redacted");
  });

  it("does not invent an origin when configuration is missing", () => {
    expect(configuredAppUrl("")).toBeNull();
    expect(accountActionUrl("reset-password?token=redacted", "")).toBeNull();
  });

  it("rejects unsafe or malformed origins", () => {
    expect(configuredAppUrl("javascript:alert(1)")).toBeNull();
    expect(configuredAppUrl("//evil.example")).toBeNull();
    expect(configuredAppUrl("https://user:password@example.com")).toBeNull();
    expect(configuredAppUrl("not-a-url")).toBeNull();
    expect(configuredAppUrl("http://localhost:3000/")).toBe("http://localhost:3000");
  });
});
