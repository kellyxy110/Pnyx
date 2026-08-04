"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Space = { slug: string; name: string };

function spacesFromResponse(data: unknown): Space[] {
  if (Array.isArray(data)) return data.filter((space): space is Space => Boolean(space && typeof space === "object" && typeof (space as Space).slug === "string" && typeof (space as Space).name === "string"));
  return [];
}

/** Accepts either a pasted Pnyx discussion URL or a raw discussion ID and resolves the ID either way — never asks the user to know or find an internal ID. */
function extractDiscussionId(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/posts\/([a-zA-Z0-9]+)/);
  return match ? match[1] : trimmed;
}

export function KnowledgeEditor() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesState, setSpacesState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [form, setForm] = useState({ spaceSlug: "", type: "GUIDE", title: "", summary: "", body: "", sourceDiscussion: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/spaces", { cache: "no-store" }).then(async (response) => {
      const data = await response.json().catch(() => null);
      if (!active) return;
      if (!response.ok) { setSpacesState("error"); return; }
      const nextSpaces = spacesFromResponse(data);
      setSpaces(nextSpaces);
      setSpacesState(nextSpaces.length ? "ready" : "empty");
      setForm((current) => current.spaceSlug || !nextSpaces[0] ? current : { ...current, spaceSlug: nextSpaces[0].slug });
    }).catch(() => { if (active) setSpacesState("error"); });
    return () => { active = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const sourcePostId = form.sourceDiscussion.trim() ? extractDiscussionId(form.sourceDiscussion) : undefined;
    const response = await fetch("/api/artifacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceSlug: form.spaceSlug, type: form.type, title: form.title, summary: form.summary, body: form.body, sourcePostId }),
    });
    const result = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) { setMessage(result?.error ?? "Could not save this artifact. Check the required fields and try again."); return; }
    router.push(`/knowledge/${result.artifact.id}`);
  }

  async function assist() {
    if (!form.sourceDiscussion.trim()) { setMessage("Link a discussion first, then Scout can draft from it."); return; }
    setDraftBusy(true);
    const postId = extractDiscussionId(form.sourceDiscussion);
    const response = await fetch(`/api/ai/draft`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
    const result = await response.json().catch(() => null);
    setDraftBusy(false);
    if (!response.ok) { setMessage(result?.error ?? "Could not draft from this discussion."); return; }
    setForm((f) => ({ ...f, body: result.text ?? f.body }));
    setMessage("AI draft inserted for review. Edit it before saving.");
  }

  const unableToSave = spacesState !== "ready" || busy;

  return (
    <form onSubmit={submit} className="panel space-y-4" aria-label="Create a knowledge artifact">
      <p className="help mt-2">AI assistance only uses a discussion you link below, and never publishes automatically — you always review and save.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>Space
          <select required value={form.spaceSlug} disabled={spacesState !== "ready"} onChange={(e) => setForm({ ...form, spaceSlug: e.target.value })} aria-describedby="knowledge-space-help">
            <option value="">{spacesState === "loading" ? "Loading Spaces…" : spacesState === "empty" ? "No Spaces available" : "Choose a Space"}</option>
            {spaces.map((space) => <option key={space.slug} value={space.slug}>{space.name}</option>)}
          </select>
          <small id="knowledge-space-help">{spacesState === "ready" ? "Where does this knowledge belong?" : spacesState === "empty" ? "A moderator needs to create a public Space first." : spacesState === "error" ? "Spaces could not be loaded. Refresh and try again." : "Loading available Spaces."}</small>
        </label>
        <label>Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["GUIDE", "ANSWER", "RESEARCH", "BENCHMARK", "CASE_STUDY"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label>Link a discussion <span className="help">(optional)</span>
        <input value={form.sourceDiscussion} onChange={(e) => setForm({ ...form, sourceDiscussion: e.target.value })} placeholder="Paste a discussion link, e.g. https://pnyx.app/posts/…" />
        <span className="help">Only link a discussion you&rsquo;re allowed to reuse. The original discussion and its author stay attributed on the artifact.</span>
      </label>
      <button type="button" className="button-outline" disabled={draftBusy} onClick={() => void assist()}>{draftBusy ? "Drafting…" : "Assist from linked discussion"}</button>
      <label>Title<input required minLength={3} maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Name the knowledge clearly" /></label>
      <label>Summary<textarea rows={3} maxLength={1000} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="What will readers learn?" /></label>
      <label>Body<textarea required rows={12} maxLength={50000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write or edit the durable explanation in Markdown." /></label>
      <footer className="flex gap-2">
        <button className="button-primary" disabled={unableToSave}>{busy ? "Saving…" : "Save draft"}</button>
      </footer>
      {message && <p role="status" className="help">{message}</p>}
    </form>
  );
}
