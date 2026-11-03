import { describe, expect, it } from "vitest";
import { searchQuerySchema } from "./search-validation";
describe("search validation", () => { it("requires a useful query", () => { expect(searchQuerySchema.safeParse({ q: "a" }).success).toBe(false); expect(searchQuerySchema.parse({ q: "react" }).type).toBe("all"); }); });it("rejects reversed date ranges and invalid paging", () => {
  expect(searchQuerySchema.safeParse({ q: "react", from: "2026-10-30", to: "2026-01-01" }).success).toBe(false);
  expect(searchQuerySchema.safeParse({ q: "react", page: "1.5" }).success).toBe(false);
});
