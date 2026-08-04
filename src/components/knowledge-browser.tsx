"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Artifact = { id: string; title: string; summary: string | null; type: string; status: string; updatedAt: string; author: { displayName: string; username: string }; space: { name: string; slug: string }; _count: { revisions: number; sources: number; contributors: number } };
type Filters = { q: string; type: string; status: string };

export function KnowledgeBrowser() {
  const [items, setItems] = useState<Artifact[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [state, setState] = useState("Loading knowledge…");

  const load = useCallback(async (next: number, filters: Filters) => {
    setState("Loading knowledge…");
    const params = new URLSearchParams({ page: String(next) });
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    try {
      const response = await fetch(`/api/artifacts?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const artifacts = data.artifacts ?? [];
      setItems((current) => next === 1 ? artifacts : [...current, ...artifacts]);
      setPage(next);
      setMore(Boolean(data.hasMore));
      setState(artifacts.length || next > 1 ? "" : "No knowledge matches these filters.");
    } catch (error) {
      setState(error instanceof Error ? error.message : "Knowledge could not be loaded.");
    }
  }, []);

  useEffect(() => { void load(1, { q: "", type: "", status: "" }); }, [load]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void load(1, { q, type, status });
  }

  return <section className="space-y-5" aria-labelledby="knowledge-list-title">
    <div><p className="eyebrow">Organised knowledge</p><h2 id="knowledge-list-title" className="text-3xl font-semibold text-[var(--navy)]">Guides, answers, and research</h2></div>
    <form onSubmit={submit} className="panel grid gap-3 md:grid-cols-4">
      <label>Search knowledge<input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Topic or phrase" /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value)}><option value="">All types</option>{["GUIDE", "ANSWER", "RESEARCH", "BENCHMARK", "CASE_STUDY"].map((value) => <option value={value} key={value}>{value.replace("_", " ").toLowerCase()}</option>)}</select></label>
      <label>Verification<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Any published status</option>{["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"].map((value) => <option value={value} key={value}>{value.replace("_", " ").toLowerCase()}</option>)}</select></label>
      <button className="button-primary self-end">Find knowledge</button>
    </form>
    {items.length ? <div className="space-y-4">{items.map((artifact) => <article key={artifact.id} className="panel"><div className="flex flex-wrap justify-between gap-2"><span className="badge">{artifact.type.toLowerCase()} · {artifact.status.toLowerCase().replace("_", " ")}</span><Link className="text-link" href={`/spaces/${artifact.space.slug}`}>{artifact.space.name}</Link></div><h3 className="mt-3 text-xl font-semibold"><Link href={`/knowledge/${artifact.id}`} className="hover:underline">{artifact.title}</Link></h3>{artifact.summary && <p className="mt-2 text-[var(--muted)]">{artifact.summary}</p>}<p className="mt-3 text-sm text-[var(--muted)]">By {artifact.author.displayName} · {artifact._count.revisions} revision{artifact._count.revisions === 1 ? "" : "s"} · {artifact._count.sources} source{artifact._count.sources === 1 ? "" : "s"}</p></article>)}</div> : <p className="panel" role="status">{state}</p>}
    {items.length > 0 && <p role="status" className="help">{state}</p>}
    {more && <button type="button" className="button-outline" onClick={() => void load(page + 1, { q, type, status })}>Load more knowledge</button>}
  </section>;
}