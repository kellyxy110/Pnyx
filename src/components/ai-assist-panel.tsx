"use client";

import Link from "next/link";
import { useState } from "react";

type Related = { id: string; title: string; body: string };
type AiResponse = {
  error?: string;
  output?: { id?: string };
  text?: string;
  status?: string;
  message?: string;
  related?: Related[];
};

export function AiAssistPanel({ postId }: { postId: string }) {
  const [result, setResult] = useState<{ outputId?: string; text?: string | null; status?: string; message?: string; related?: Related[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function readJson(response: Response): Promise<AiResponse> {
    try {
      return await response.json() as AiResponse;
    } catch {
      return {};
    }
  }

  async function run(kind: "summary" | "tags" | "source_suggestions" | "related") {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/ai/posts/${postId}/${kind}`, { method: "POST" });
      const data = await readJson(response);
      if (!response.ok) {
        setNotice(data.error ?? "AI assistance is unavailable. Please try again later.");
        return;
      }
      setResult({ outputId: data.output?.id, text: data.text, status: data.status, message: data.message, related: data.related });
    } catch {
      setNotice("We could not reach AI assistance. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  async function feedback(type: "ACCEPT" | "CORRECT" | "REPORT" | "DISABLE") {
    if (!result?.outputId) return;
    try {
      const response = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputId: result.outputId, type }),
      });
      const data = await readJson(response);
      setNotice(response.ok ? (type === "DISABLE" ? "AI assistance disabled for your account." : "Feedback saved.") : data.error ?? "Could not save feedback.");
    } catch {
      setNotice("We could not save your feedback. Please try again later.");
    }
  }

  return <section className="panel border-[var(--blue)]/30" aria-labelledby="ai-assist-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="eyebrow">AI assistance</p>
        <h2 id="ai-assist-title" className="text-xl font-semibold text-[var(--navy)]">Make this discussion easier to use</h2>
        <p className="help mt-1">Generated text is a draft, not a verified answer. Only this public discussion is used.</p>
      </div>
      <span className="badge">AI-assisted</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button className="button-outline" disabled={busy} onClick={() => run("summary")}>Summarize</button>
      <button className="button-outline" disabled={busy} onClick={() => run("tags")}>Suggest tags</button>
      <button className="button-outline" disabled={busy} onClick={() => run("source_suggestions")}>Suggest sources</button>
      <button className="button-outline" disabled={busy} onClick={() => run("related")}>Find related</button>
    </div>
    {busy && <p className="help mt-3" role="status" aria-live="polite">Generating a careful suggestion…</p>}
    {result && <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/70 p-4">
      <p className="text-sm font-medium text-[var(--navy)]">{result.status === "COMPLETED" ? "Generated suggestion" : "AI unavailable"}</p>
      {result.text && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{result.text}</p>}
      {result.related?.length ? <ul className="mt-2 list-disc pl-5 text-sm">{result.related.map((item) => <li key={item.id}><Link className="text-link" href={`/posts/${item.id}`}>{item.title}</Link></li>)}</ul> : null}
      {result.message && <p className="help mt-2">{result.message}</p>}
      {result.outputId && result.status === "COMPLETED" && <div className="mt-4 flex flex-wrap gap-2">
        <button className="button-outline" onClick={() => feedback("ACCEPT")}>Useful</button>
        <button className="button-outline" onClick={() => feedback("CORRECT")}>Needs correction</button>
        <button className="button-outline" onClick={() => feedback("REPORT")}>Report</button>
        <button className="button-outline" onClick={() => feedback("DISABLE")}>Disable AI</button>
      </div>}
    </div>}
    {notice && <p className="help mt-3" role="status" aria-live="polite">{notice}</p>}
  </section>;
}