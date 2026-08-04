import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnv } from "./env";

const { queryRawMock } = vi.hoisted(() => ({ queryRawMock: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRawMock } }));

import { checkHealth } from "./health";

const validEnv = { DATABASE_URL: "postgresql://user:pass@localhost:5432/pnyx", APP_URL: "http://localhost:3000", NODE_ENV: "test" as const };

describe("environment validation", () => {
  it("accepts PostgreSQL configuration and applies safe defaults", () => {
    expect(getEnv(validEnv).NODE_ENV).toBe("test");
  });

  it("rejects a non-PostgreSQL database", () => {
    expect(() => getEnv({ ...validEnv, DATABASE_URL: "https://example.com" })).toThrow();
  });
});

describe("health recovery", () => {
  afterEach(() => queryRawMock.mockReset());

  it("reports healthy after a successful database probe", async () => {
    queryRawMock.mockResolvedValueOnce([{ "?column?": 1 }]);

    const result = await checkHealth();

    expect(result).toMatchObject({ status: "ok", service: "pnyx", database: "ok" });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it("degrades safely when the database probe fails", async () => {
    queryRawMock.mockRejectedValueOnce(new Error("database unavailable"));

    const result = await checkHealth();

    expect(result).toMatchObject({ status: "degraded", service: "pnyx", database: "error" });
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});