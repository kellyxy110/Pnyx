import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("environment validation", () => {
  it("accepts PostgreSQL configuration and applies safe defaults", () => {
    expect(getEnv({ DATABASE_URL: "postgresql://user:pass@localhost:5432/pnyx", APP_URL: "http://localhost:3000" }).NODE_ENV).toBe("development");
  });

  it("rejects a non-PostgreSQL database", () => {
    expect(() => getEnv({ DATABASE_URL: "https://example.com", APP_URL: "http://localhost:3000" })).toThrow();
  });
});
