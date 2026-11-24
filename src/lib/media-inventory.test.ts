import { expect, it } from "vitest";
import { classifyMediaInventory } from "./media-inventory";
const key = "users/synthetic/avatar/old.webp", now = new Date("2026-11-24T12:00:00Z");
it("protects current pointers and receipts regardless of age", () => { expect(classifyMediaInventory([{ key, lastModified: new Date(0) }], new Set([key]), new Set(), now)[0].status).toBe("referenced"); expect(classifyMediaInventory([{ key }], new Set(), new Set([key]), now)[0].status).toBe("tracked"); });
it("old managed untracked objects require review, never deletion", () => { expect(classifyMediaInventory([{ key, lastModified: new Date(0) }], new Set(), new Set(), now)).toEqual([{ key, status: "review" }]); });
it("protects recent in-flight writes", () => { expect(classifyMediaInventory([{ key, lastModified: now }], new Set(), new Set(), now)[0].status).toBe("recent"); });
it("classifies missing dates, invalid dates and unmanaged objects as unknown", () => { for (const object of [{ key }, { key, lastModified: new Date("invalid") }, { key: "unmanaged/private.txt", lastModified: new Date(0) }]) expect(classifyMediaInventory([object], new Set(), new Set(), now)[0].status).toBe("unknown"); });
