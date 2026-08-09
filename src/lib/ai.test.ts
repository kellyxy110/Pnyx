import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAi } from "./ai";

afterEach(() => { delete process.env.GROQ_API_KEY; delete process.env.PNYX_AI_TIMEOUT_MS; vi.restoreAllMocks(); });
describe("AI orchestration", () => {
  it("returns a safe unavailable state when no provider is configured", async () => { const result = await generateAi("SUMMARY", "Public discussion"); expect(result.status).toBe("UNAVAILABLE"); expect(result.text).toBeNull(); });
  it("rejects oversized context before making a provider request", async () => { process.env.GROQ_API_KEY = "test"; const result = await generateAi("SUMMARY", "x".repeat(12001)); expect(result.status).toBe("FAILED"); expect(result.error).toContain("input limit"); });
  it("retries a provider failure once before returning a safe failure", async () => {
    process.env.GROQ_API_KEY = "test";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("provider unavailable"));

    const result = await generateAi("SUMMARY", "Public discussion");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ status: "FAILED", text: null, error: "provider unavailable" });
  });
  it("does not publish malformed provider output", async () => {
    process.env.GROQ_API_KEY = "test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) } as Response);

    const result = await generateAi("SUMMARY", "Public discussion");

    expect(result).toMatchObject({ status: "FAILED", text: null, error: "invalid_provider_response" });
  });
});