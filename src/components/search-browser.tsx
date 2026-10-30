"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
type Result={id:string;title?:string;body?:string;summary?:string;name?:string;slug?:string;displayName?:string;username?:string;bio?:string;space?:{name:string;slug:string};author?:{displayName:string;username:string};post?:{id:string;title:string};description?:string};
type Results={posts:Result[];replies:Result[];artifacts:Result[];spaces:Result[];people:Result[]};
type SpaceOption={slug:string;name:string};

type Criteria = { q: string; type: string; space: string; author: string; status: string; from: string; to: string };
const kinds = ["posts", "replies", "artifacts", "spaces", "people"] as const;
const categoryNames = { posts: "Discussions", replies: "Replies", artifacts: "Knowledge", spaces: "Spaces", people: "People" };
const emptyFilters = { space: "", author: "", status: "", from: "", to: "" };

export function SearchBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState("all");
  const [filters, setFilters] = useState(emptyFilters);
  const [spaceOptions, setSpaceOptions] = useState<SpaceOption[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const [submitted, setSubmitted] = useState<Criteria | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [message, setMessage] = useState("Start with a topic, a question, or someone’s name.");
  const [error, setError] = useState("");
  const [failedSearch, setFailedSearch] = useState<{ criteria: Criteria; page: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const queryInput = useRef<HTMLInputElement>(null);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const resultCount = results ? Object.values(results).reduce((sum, items) => sum + items.length, 0) : 0;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/spaces", { cache: "no-store", signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data)) setSpaceOptions(data.filter((item): item is SpaceOption => Boolean(item && typeof item.slug === "string" && typeof item.name === "string")));
    }).catch(() => {});
    return () => controller.abort();
  }, []);

  const search = useCallback(async (criteria: Criteria, nextPage = 1) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setFailedSearch(null);
    setMessage("Searching the commons…");
    if (nextPage === 1) { setResults(null); setHasMore(false); }
    const params = new URLSearchParams({ q: criteria.q.trim(), type: criteria.type, page: String(nextPage) });
    for (const key of ["space", "author", "status", "from", "to"] as const) {
      if (criteria[key].trim()) params.set(key, criteria[key].trim());
    }
    try {
      const response = await fetch(`/api/search?${params}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search could not be completed.");
      if (!data.results || !kinds.every(kind => Array.isArray(data.results[kind]))) throw new Error("Search returned an unexpected response.");
      if (controller.signal.aborted) return;
      const incoming = data.results as Results;
      setResults(current => nextPage === 1 ? incoming : Object.fromEntries(kinds.map(kind => [kind, [...(current?.[kind] ?? []), ...incoming[kind]]])) as Results);
      setSubmitted(criteria);
      setPage(nextPage);
      setHasMore(kinds.some(kind => incoming[kind].length === 10));
      setMessage("");
    } catch (failure) {
      if (controller.signal.aborted) return;
      setMessage("");
      setFailedSearch({ criteria, page: nextPage });
      setError(failure instanceof Error && failure.message !== "Failed to fetch" ? failure.message : "We couldn’t connect. Check your connection and try again.");
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }, []);

  useEffect(() => {
    setQ(initialQuery);
    if (initialQuery.trim().length >= 2 && initialQuery.trim().length <= 120) void search({ q: initialQuery, type: "all", ...emptyFilters });
    return () => request.current?.abort();
  }, [initialQuery, search]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (q.trim().length < 2) { setFailedSearch(null); setError("Enter at least two characters to search."); queryInput.current?.focus(); return; }
    void search({ q, type, ...filters });
  }

  function changeFilter(key: keyof typeof emptyFilters, value: string) {
    setFilters(current => ({ ...current, [key]: value }));
  }
  function card(item:Result,kind:string){if(kind==="posts")return <article className="panel" key={item.id}><span className="badge">discussion</span><h3 className="mt-2 text-xl font-semibold"><Link href={`/posts/${item.id}`} className="hover:underline">{item.title}</Link></h3><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[var(--muted)]">{item.body}</p><p className="help mt-3">{item.author?.displayName} · {item.space?.name}</p></article>;if(kind==="replies")return <article className="panel" key={item.id}><span className="badge">reply</span><p className="mt-2 whitespace-pre-wrap">{item.body}</p><p className="help mt-3">In <Link className="text-[var(--blue)]" href={`/posts/${item.post?.id}`}>{item.post?.title}</Link> · {item.author?.displayName}</p></article>;if(kind==="artifacts")return <article className="panel" key={item.id}><span className="badge">knowledge artifact</span><h3 className="mt-2 text-xl font-semibold"><Link href={`/knowledge/${item.id}`} className="hover:underline">{item.title}</Link></h3><p className="mt-2 text-[var(--muted)]">{item.summary??item.body}</p><p className="help mt-3">{item.author?.displayName} · {item.space?.name}</p></article>;if(kind==="spaces")return <article className="panel" key={item.id}><span className="badge">Space</span><h3 className="mt-2 text-xl font-semibold"><Link href={`/spaces/${item.slug}`}>{item.name}</Link></h3><p className="mt-2 text-[var(--muted)]">{item.description}</p></article>;return <article className="panel" key={item.id}><span className="badge">person</span><h3 className="mt-2 text-xl font-semibold"><Link href={`/people/${item.username}`} className="hover:underline">{item.displayName}</Link></h3><p className="help">@{item.username}</p>{item.bio&&<p className="mt-2 text-[var(--muted)]">{item.bio}</p>}</article>}

  return <section className="search-surface" aria-labelledby="search-heading">
    <header className="search-heading"><p className="eyebrow">Search the commons</p><h1 id="search-heading">Find your next <em>insight.</em></h1><p>Good questions deserve great discoveries. Explore public knowledge, conversations, and the people behind them.</p></header>
    <form onSubmit={submit} className="search-workbench" aria-label="Search Pnyx" role="search">
      <label className="search-query-label" htmlFor="explore-query">What are you curious about?</label>
      <div className="search-query-row">
        <div className="search-query-wrap">
          <input ref={queryInput} id="explore-query" name="q" type="search" required minLength={2} maxLength={120} value={q} onChange={event => setQ(event.target.value)} placeholder="Search ideas, questions, people…" aria-describedby="search-hint" />
          {q && <button type="button" className="search-clear" onClick={() => { setQ(""); queryInput.current?.focus(); }}>Clear<span className="sr-only"> search</span></button>}
        </div>
        <button className="button-primary search-submit" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </div>
      <p id="search-hint" className="search-hint">2–120 characters · Public content only</p>
      <div className="search-refinements">
        <label>Look in<select value={type} onChange={event => setType(event.target.value)}>{[["all", "Everything"], ["posts", "Discussions"], ["replies", "Replies"], ["artifacts", "Knowledge"], ["spaces", "Spaces"], ["people", "People"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <details className="search-filters">
          <summary>Refine search{activeFilterCount > 0 && <span className="search-filter-count">{activeFilterCount}<span className="sr-only"> active filters</span></span>}</summary>
          <div className="search-filter-fields">
            <label>Space<select value={filters.space} onChange={event => changeFilter("space", event.target.value)}><option value="">Any Space</option>{spaceOptions.map(option => <option key={option.slug} value={option.slug}>{option.name}</option>)}</select></label>
            <label>Author username<input value={filters.author} onChange={event => changeFilter("author", event.target.value)} placeholder="e.g. alex" autoCapitalize="none" /></label>
            <label>Verification status<select value={filters.status} onChange={event => changeFilter("status", event.target.value)}><option value="">Any public status</option><option value="PUBLISHED">Published</option><option value="COMMUNITY_REVIEWED">Community reviewed</option><option value="VERIFIED">Verified</option></select></label>
            <label>From date<input type="date" value={filters.from} max={filters.to || undefined} onChange={event => changeFilter("from", event.target.value)} /></label>
            <label>To date<input type="date" value={filters.to} min={filters.from || undefined} onChange={event => changeFilter("to", event.target.value)} /></label>
            <button type="button" className="button-outline" onClick={() => setFilters(emptyFilters)} disabled={!activeFilterCount}>Reset filters</button>
          </div>
        </details>
      </div>
    </form>
    <div className="search-feedback" role="status" aria-live="polite" aria-atomic="true">{message || (results && `${resultCount} result${resultCount === 1 ? "" : "s"} loaded for “${submitted?.q.trim()}”.`)}</div>
    {error && <div role="alert" className="search-error"><strong>Search needs another try.</strong><p>{error}</p>{failedSearch && <button type="button" className="button-outline" disabled={busy} onClick={() => void search(failedSearch.criteria, failedSearch.page)}>Try again</button>}</div>}
    {results && resultCount === 0 && <div className="search-empty"><p className="eyebrow">Room to explore</p><h2>No matches this time.</h2><p>Try fewer words, a different spelling, or fewer filters. Only public content appears here.</p>{activeFilterCount > 0 && <button type="button" className="button-outline" disabled={busy} onClick={() => { setFilters(emptyFilters); void search({ q, type, ...emptyFilters }); }}>Search without filters</button>}</div>}
    <div aria-busy={busy} className="search-results">{results && kinds.map(kind => results[kind].length ? <section key={kind} aria-labelledby={`${kind}-title`}><div className="search-category-heading"><h2 id={`${kind}-title`}>{categoryNames[kind]}</h2><span>{results[kind].length}</span></div><div className="grid gap-4 lg:grid-cols-2">{results[kind].map(item => card(item, kind))}</div></section> : null)}</div>
    {results && hasMore && submitted && <button type="button" className="button-outline" disabled={busy} onClick={() => void search(submitted, page + 1)}>{busy ? "Loading…" : "Load more results"}</button>}
  </section>;
}
