import { z } from "zod";

const MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
const POLICY_VERSION = "pnyx-ai-2026-07-28-v1";
const MAX_INPUT = 12000;
const responseSchema = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1) });

export type AiKind = "SUMMARY" | "TAGS" | "RELATED" | "SOURCE_SUGGESTIONS" | "ARTIFACT_DRAFT";
export type AiResult = { provider: string; model: string; policyVersion: string; status: "COMPLETED" | "UNAVAILABLE" | "FAILED"; text: string | null; sourceIds: string[]; latencyMs: number; error?: string };

function promptFor(kind: AiKind, context: string) {
  const instruction = kind === "SUMMARY" ? "Summarize the discussion in 3 concise sentences. Do not invent facts or claim verification."
    : kind === "TAGS" ? "Return 3 to 6 concise technology tags as a JSON array of strings. Return only JSON."
    : kind === "SOURCE_SUGGESTIONS" ? "Suggest documentation or repository search terms, not fabricated URLs. Return a JSON array of objects with title, query, and reason."
    : kind === "ARTIFACT_DRAFT" ? "Draft a clear knowledge artifact from only the supplied discussion. Preserve uncertainty, do not invent citations, and include a short summary followed by the draft body."
    : "Identify up to 5 related topics or duplicate risks from the supplied public discussion. Return a JSON array of concise strings.";
  return `${instruction}\n\nUser-selected public context:\n${context}`;
}

export async function generateAi(kind: AiKind, context: string): Promise<AiResult> {
  const started = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  const provider = apiKey ? "groq" : "unconfigured";
  if (!apiKey) return { provider, model: MODEL, policyVersion: POLICY_VERSION, status: "UNAVAILABLE", text: null, sourceIds: [], latencyMs: Date.now() - started, error: "AI provider is not configured." };
  if (context.length > MAX_INPUT) return { provider, model: MODEL, policyVersion: POLICY_VERSION, status: "FAILED", text: null, sourceIds: [], latencyMs: Date.now() - started, error: "Selected context exceeds the AI input limit." };
  const body = { model: MODEL, temperature: 0.2, max_tokens: kind === "ARTIFACT_DRAFT" ? 1200 : 500, messages: [{ role: "system", content: "You are a careful assistant for Pnyx. Follow source boundaries. Never present generated text as verified or human-authored." }, { role: "user", content: promptFor(kind, context) }] };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 12000);
    try { const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body), signal: controller.signal }); if (!response.ok) throw new Error(`provider_${response.status}`); const parsed = responseSchema.safeParse(await response.json()); if (!parsed.success) throw new Error("invalid_provider_response"); return { provider, model: MODEL, policyVersion: POLICY_VERSION, status: "COMPLETED", text: parsed.data.choices[0].message.content, sourceIds: [], latencyMs: Date.now() - started }; } catch (error) { if (attempt === 1) return { provider, model: MODEL, policyVersion: POLICY_VERSION, status: "FAILED", text: null, sourceIds: [], latencyMs: Date.now() - started, error: error instanceof Error ? error.message : "AI request failed." }; } finally { clearTimeout(timer); }
  }
  return { provider, model: MODEL, policyVersion: POLICY_VERSION, status: "FAILED", text: null, sourceIds: [], latencyMs: Date.now() - started, error: "AI request failed." };
}

export { POLICY_VERSION };