import { describe, expect, it } from "vitest";
import { postSchema, replySchema } from "./discussion-validation";
describe("discussion validation", () => {
  it("accepts a complete post", () => expect(postSchema.parse({ spaceSlug: "programming", type: "QUESTION", title: "How should I test this?", body: "Use **small tests** and a code block.", visibility: "PUBLIC" }).type).toBe("QUESTION"));
  it("rejects unsafe space slugs and empty replies", () => { expect(() => postSchema.parse({ spaceSlug: "../admin", type: "DISCUSSION", title: "Valid title", body: "x" })).toThrow(); expect(() => replySchema.parse({ body: " " })).toThrow(); });
});
