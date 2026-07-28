import { describe, expect, it } from "vitest";
import { searchQuerySchema } from "./search-validation";
describe("search validation", () => { it("requires a useful query", () => { expect(searchQuerySchema.safeParse({ q: "a" }).success).toBe(false); expect(searchQuerySchema.parse({ q: "react" }).type).toBe("all"); }); });