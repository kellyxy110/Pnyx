import { afterEach, describe, expect, it } from "vitest";
import { generateAi } from "./ai";

afterEach(() => { delete process.env.GROQ_API_KEY; });
describe("AI orchestration", () => {
  it("returns a safe unavailable state when no provider is configured", async () => { const result = await generateAi("SUMMARY", "Public discussion"); expect(result.status).toBe("UNAVAILABLE"); expect(result.text).toBeNull(); });
  it("rejects oversized context before making a provider request", async () => { process.env.GROQ_API_KEY = "test"; const result = await generateAi("SUMMARY", "x".repeat(12001)); expect(result.status).toBe("FAILED"); expect(result.error).toContain("input limit"); });
});