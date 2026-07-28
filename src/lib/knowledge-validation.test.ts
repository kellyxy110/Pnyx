import { describe, expect, it } from "vitest";
import { artifactSchema, sourceSchema } from "./knowledge-validation";
describe("knowledge validation", () => {
  it("accepts a sourced artifact", () => expect(artifactSchema.parse({ spaceSlug: "programming", type: "GUIDE", title: "A practical guide", body: "Use **clear sections**." }).type).toBe("GUIDE"));
  it("rejects invalid source URLs", () => expect(() => sourceSchema.parse({ url: "not-a-url" })).toThrow());
});
