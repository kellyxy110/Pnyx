"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type Draft = { id: string; title: string; body: string; type: "QUESTION" | "DISCUSSION" | "SHOWCASE" | "TUTORIAL" | "RESEARCH" | "POLL"; visibility: "PUBLIC" | "SPACE_ONLY" | "FOLLOWERS_ONLY" | "PRIVATE"; updatedAt: string; space: { slug: string; name: string } };
type Space = { slug: string; name: string };
type ComposerForm = { spaceSlug: string; type: Draft["type"]; title: string; body: string; visibility: Draft["visibility"] };

function spacesFromResponse(data: unknown): Space[] {
  if (Array.isArray(data)) return data.filter((space): space is Space => Boolean(space && typeof space === "object" && typeof (space as Space).slug === "string" && typeof (space as Space).name === "string"));
  if (data && typeof data === "object" && Array.isArray((data as { spaces?: unknown }).spaces)) return spacesFromResponse((data as { spaces: unknown }).spaces);
  return [];
}

type PostComposerProps = { initialSpaceSlug?: string; returnTo?: string };

export function PostComposer({ initialSpaceSlug, returnTo }: PostComposerProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesState, setSpacesState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [form, setForm] = useState<ComposerForm>({ spaceSlug: initialSpaceSlug ?? "", type: "DISCUSSION", title: "", body: "", visibility: "PUBLIC" });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<"saving" | "publishing" | null>(null);
  const lastSaved = useRef("");
  const serialise = (value = form) => JSON.stringify(value);

  useEffect(() => {
    let active = true;
    async function loadComposerData() {
      setSpacesState("loading");
      try {
        const [spaceResponse, draftResponse] = await Promise.all([fetch("/api/spaces", { cache: "no-store" }), fetch("/api/posts?drafts=true", { cache: "no-store" })]);
        const spaceData = await spaceResponse.json().catch(() => null);
        const draftData = await draftResponse.json().catch(() => null);
        if (!spaceResponse.ok) throw new Error(spaceData?.error ?? "Spaces could not be loaded.");
        const nextSpaces = spacesFromResponse(spaceData);
        if (!active) return;
        setSpaces(nextSpaces);
        setSpacesState(nextSpaces.length ? "ready" : "empty");
        setForm((current) => current.spaceSlug || !nextSpaces[0] ? current : { ...current, spaceSlug: nextSpaces[0].slug });
        if (draftResponse.ok) setDrafts(draftData?.drafts ?? []);
      } catch (error) {
        if (!active) return;
        setSpacesState("error");
        setMessage(error instanceof Error ? error.message : "Composer data could not be loaded. Try again.");
      }
    }
    void loadComposerData();
    return () => { active = false; };
  }, []);

  async function saveDraft(silent = false) {
    if (!form.spaceSlug || !form.title.trim() || !form.body.trim() || busy) return;
    const payload = { ...form, isDraft: true };
    setBusy("saving");
    const response = await fetch(draftId ? `/api/posts/${draftId}` : "/api/posts", { method: draftId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { if (!silent) setMessage(result?.error ?? "Draft could not be saved."); }
    else {
      const id = result.post?.id as string | undefined;
      if (id) {
        setDraftId(id);
        setDrafts((current) => [{ id, title: form.title, body: form.body, type: form.type, visibility: form.visibility, updatedAt: new Date().toISOString(), space: { slug: form.spaceSlug, name: spaces.find((space) => space.slug === form.spaceSlug)?.name ?? "Space" } }, ...current.filter((draft) => draft.id !== id)]);
      }
      lastSaved.current = serialise();
      if (!silent) setMessage("Draft saved.");
    }
    setBusy(null);
  }

  useEffect(() => {
    const current = serialise();
    if (!form.spaceSlug || !form.title.trim() || !form.body.trim() || current === lastSaved.current || busy) return;
    const timer = window.setTimeout(() => { void saveDraft(true); }, 1800);
    return () => window.clearTimeout(timer);
  }, [form, busy]); // eslint-disable-line react-hooks/exhaustive-deps

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.spaceSlug) { setMessage("Choose a Space before publishing."); return; }
    if (form.title.trim().length < 3) { setMessage("Add a clear title with at least 3 characters."); return; }
    if (!form.body.trim()) { setMessage("Write a little context before publishing."); return; }
    setBusy("publishing"); setMessage("");
    const payload = { ...form, isDraft: false };
    const response = await fetch(draftId ? `/api/posts/${draftId}` : "/api/posts", { method: draftId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setMessage(result?.error ?? "Discussion could not be published."); setBusy(null); return; }
    const id = result.post?.id;
    setMessage("Published. Opening your discussion…");
    setForm((current) => ({ ...current, title: "", body: "" }));
    setDrafts((current) => current.filter((draft) => draft.id !== draftId));
    setDraftId(null); lastSaved.current = ""; setBusy(null);
    if (id) {
      const safeReturnTo = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
      window.setTimeout(() => window.location.assign(safeReturnTo ?? `/posts/${id}`), 600);
    }
  }

  function recover(draft: Draft) {
    setForm({ spaceSlug: draft.space.slug, type: draft.type, title: draft.title, body: draft.body, visibility: draft.visibility });
    setDraftId(draft.id);
    lastSaved.current = JSON.stringify({ spaceSlug: draft.space.slug, type: draft.type, title: draft.title, body: draft.body, visibility: draft.visibility });
    setMessage(`Editing draft: ${draft.title}`);
  }

  const unableToPublish = spacesState !== "ready" || Boolean(busy);
  const selectedSpace = spaces.find((space) => space.slug === form.spaceSlug);
  return <section className="composer" id="composer" aria-labelledby="composer-title"><form onSubmit={publish}><header><p className="eyebrow">Start a conversation</p><h2 id="composer-title">Share an idea, question, or useful finding</h2><p>Markdown is supported. Drafts save automatically after you pause typing.</p>{selectedSpace && returnTo && <p className="composer-context" role="status">Posting in <strong>{selectedSpace.name}</strong>. After publishing, you’ll return to this Space.</p>}</header><div className="composer-fields"><label>Space<select required value={form.spaceSlug} disabled={spacesState !== "ready"} onChange={(event) => setForm({ ...form, spaceSlug: event.target.value })} aria-describedby="composer-space-help"><option value="">{spacesState === "loading" ? "Loading Spaces…" : spacesState === "empty" ? "No Spaces available" : "Choose a Space"}</option>{spaces.map((space) => <option key={space.slug} value={space.slug}>{space.name}</option>)}</select><small id="composer-space-help">{spacesState === "ready" ? selectedSpace && returnTo ? `This discussion will be published in ${selectedSpace.name}.` : "Choose where this conversation belongs." : spacesState === "empty" ? "A moderator needs to create a public Space before discussions can be published." : spacesState === "error" ? "Spaces could not be loaded. Refresh and try again." : "Loading available Spaces."}</small></label><label>Post type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ComposerForm["type"] })}>{["DISCUSSION", "QUESTION", "SHOWCASE", "TUTORIAL", "RESEARCH", "POLL"].map((type) => <option key={type} value={type}>{type[0] + type.slice(1).toLowerCase()}</option>)}</select></label></div><label>Title<input required minLength={3} maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What should the community explore?" /></label><label>Body<textarea required minLength={1} maxLength={20000} rows={8} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Use Markdown for emphasis, links, and fenced code blocks. Mention people with @username." /></label><details className="composer-preview"><summary>Preview</summary><h3>{form.title || "Discussion title"}</h3><p>{form.body || "Your formatted discussion preview will appear here."}</p></details><footer><button type="button" className="button-outline" disabled={unableToPublish} onClick={() => void saveDraft()}>{busy === "saving" ? "Saving draft…" : "Save draft"}</button><button className="button-primary" disabled={unableToPublish}>{busy === "publishing" ? "Publishing…" : draftId ? "Publish draft" : "Publish discussion"}</button></footer>{message && <p role="status" className="composer-message">{message}</p>}</form>{drafts.length > 0 && <aside className="composer-drafts"><h3>Your drafts</h3>{drafts.map((draft) => <button type="button" key={draft.id} onClick={() => recover(draft)}><strong>{draft.title}</strong><span>{draft.space.name} · {new Date(draft.updatedAt).toLocaleDateString()}</span></button>)}<Link href="/profile">View all private drafts</Link></aside>}</section>;
}
