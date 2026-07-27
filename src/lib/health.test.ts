import { describe, expect, it } from "vitest";
import { getEnv } from "./env";

const validEnv = { DATABASE_URL: "postgresql://user:pass@localhost:5432/pnyx", APP_URL: "http://localhost:3000", NODE_ENV: "test" as const };

describe("environment validation", () => {
  it("accepts PostgreSQL configuration and applies safe defaults", () => {
    expect(getEnv(validEnv).NODE_ENV).toBe("test");
  });

  it("rejects a non-PostgreSQL database", () => {
    expect(() => getEnv({ ...validEnv, DATABASE_URL: "https://example.com" })).toThrow();
  });
});
