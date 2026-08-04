"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Contributor = { user: { displayName: string }; role: string };
type Source = { id: string; url: string; title: string | null; citation: string | null };
type Revision = { id: string; revisionNumber: number; changeSummary: string | null; editor: { displayName: string } };
type RelatedKnowledge = { id: string; title: string; summary: string | null; type: string; status: string };
type Artifact = { id: string; title: string; summary: string | null; body: string; type: string; status: string; author: { displayName: string; username: string }; space: { name: string; slug: string }; contributors: Contributor[]; sources: Source[]; revisions: Revision[] };

function headingId(heading: string, index: number) {
  return `${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"}-${index + 1}`;
}

export function KnowledgeDetail({ artifact, canEdit, sourcePost, relatedKnowledge }: { artifact: Artifact; canEdit: boolean; sourcePost: { id: string; title: string } | null; relatedKnowledge: RelatedKnowledge[] }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const headings = useMemo(() => artifact.body.split("\n").filter((line) => /^#{1,3}\s+/.test(line)).map((line, index) => {
    const title = line.replace(/^#+\s+/, "");
    return { title, id: headingId(title, index) };
  }), [artifact.body]);

  async function call(path: string, method: string, payload?: unknown) {
    const response = await fetch(path, { method, headers: payload ? { "Content-Type": "application/json" } : undefined, body: payload ? JSON.stringify(payload) : undefined });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "This action could not be completed.");
    return data;
  }
  async function addSource(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { await call(`/api/artifacts/${artifact.id}/sources`, "POST", { url, title }); setMessage("Source added. Refresh to see it in the article."); setUrl(""); setTitle(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not add source."); }
    finally { setBusy(false); }
  }
  async function removeSource(sourceId: string) {
    setBusy(true);
    try { await call(`/api/artifacts/${artifact.id}/sources?sourceId=${sourceId}`, "DELETE"); setMessage("Source removed. Refresh to update the article."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove source."); }
    finally { setBusy(false); }
  }
  async function report(event: React.FormEvent) {
    event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement); setBusy(true);
    try { await call(`/api/artifacts/${artifact.id}/report`, "POST", { reason: data.get("reason"), details: data.get("details") }); setMessage("Correction report submitted."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit correction."); }
    finally { setBusy(false); }
  }
  async function share() {
    try { await navigator.clipboard.writeText(location.href); setMessage("Knowledge link copied."); }
    catch { setMessage("Copy the address from your browser to share this article."); }
  }

  let headingIndex = 0;
  return <section className="knowledge-reading">
    <div className="knowledge-main">
      <Link href="/knowledge" className="text-link">← Knowledge library</Link>
      <article className="knowledge-article">
        <header>
          <p className="eyebrow">{artifact.space.name} · {artifact.type.toLowerCase()}</p><span className="badge">{artifact.status.toLowerCase().replace("_", " ")}</span>
          <h1>{artifact.title}</h1>{artifact.summary && <p className="knowledge-summary">{artifact.summary}</p>}
          <p className="knowledge-byline">Written by <Link href={`/people/${artifact.author.username}`}>{artifact.author.displayName}</Link> · {artifact.revisions.length} revision{artifact.revisions.length === 1 ? "" : "s"}</p>
          <div className="knowledge-actions"><button className="button-outline" onClick={share}>Share</button><Link className="button-outline" href={`/spaces/${artifact.space.slug}`}>View Space</Link></div>
        </header>
        {sourcePost && <aside className="panel mt-6"><p className="eyebrow">Source discussion</p><Link className="text-link text-lg" href={`/posts/${sourcePost.id}`}>{sourcePost.title}</Link><p className="help mt-2">This knowledge was created from a public community discussion.</p></aside>}
        <div className="knowledge-body">{artifact.body.split("\n\n").map((paragraph, index) => {
          if (/^#{1,3}\s+/.test(paragraph)) { const label = paragraph.replace(/^#+\s+/, ""); const id = headingId(label, headingIndex++); return paragraph.startsWith("### ") ? <h3 id={id} key={index}>{label}</h3> : <h2 id={id} key={index}>{label}</h2>; }
          return <p key={index}>{paragraph}</p>;
        })}</div>
        <footer className="knowledge-contributors"><strong>Contributors</strong><span>{artifact.contributors.length ? artifact.contributors.map((contributor) => `${contributor.user.displayName} (${contributor.role.toLowerCase()})`).join(", ") : "Original author"}</span></footer>
      </article>
    </div>
    <aside className="knowledge-rail">
      <section className="panel"><h2>In this article</h2>{headings.length ? <ol>{headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ol> : <p className="help">Read the full article below.</p>}</section>
      {relatedKnowledge.length > 0 && <section className="panel"><h2>Related knowledge</h2><ul className="space-y-3">{relatedKnowledge.map((item) => <li key={item.id}><Link className="text-link" href={`/knowledge/${item.id}`}>{item.title}</Link><p className="help">{item.type.toLowerCase()} · {item.status.toLowerCase().replace("_", " ")}</p>{item.summary && <p className="mt-1 text-sm text-[var(--muted)]">{item.summary}</p>}</li>)}</ul></section>}
      <section className="panel"><h2>Sources and citations</h2>{artifact.sources.length ? <ol className="knowledge-sources">{artifact.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>{source.citation && <p>{source.citation}</p>}{canEdit && <button className="text-link" disabled={busy} onClick={() => void removeSource(source.id)}>Remove source</button>}</li>)}</ol> : <p className="help">No sources added yet.</p>}{canEdit && <form onSubmit={addSource} className="knowledge-form"><label>Source URL<input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} /></label><label>Source title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><button className="button-outline" disabled={busy}>Add source</button></form>}</section>
      <section className="panel"><h2>Suggest a correction</h2><form onSubmit={report} className="knowledge-form"><label>Reason<select name="reason"><option value="INCORRECT">Incorrect</option><option value="OUTDATED">Outdated</option><option value="UNSOURCED">Needs sources</option><option value="COPYRIGHT">Copyright concern</option><option value="OTHER">Other</option></select></label><label>Details<textarea name="details" rows={4} placeholder="Explain what should be reviewed." /></label><button className="button-outline" disabled={busy}>Submit correction</button></form></section>
      <section className="panel"><h2>Revision history</h2><ol className="knowledge-revisions">{artifact.revisions.map((revision) => <li key={revision.id}><strong>Revision {revision.revisionNumber}</strong><span>{revision.changeSummary || "Updated"} · {revision.editor.displayName}</span></li>)}</ol></section>
    </aside>
    {message && <p role="status" className="knowledge-message">{message}</p>}
  </section>;
}