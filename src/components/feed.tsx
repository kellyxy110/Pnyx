"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Post = { id: string; title: string; body: string; type: string; createdAt: string; author: { displayName: string; username: string }; space: { name: string; slug: string }; viewer: { reacted: boolean; bookmarked: boolean }; _count: { replies: number; reactions: number; bookmarks: number } };

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feed, setFeed] = useState<"latest" | "following" | "trending">("latest");
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async (next = 1) => {
    setState("loading"); setMessage("");
    const response = await fetch(`/api/posts?feed=${feed}&page=${next}`);
    const result = await response.json().catch(() => null);
    if (!response.ok) { setState("error"); setMessage(result?.error ?? "Discussions could not be loaded. Please try again."); return; }
    const items = result.posts as Post[];
    setPosts((current) => next === 1 ? items : [...current, ...items]); setPage(next); setMore(Boolean(result.hasMore)); setState(items.length ? "ready" : "empty");
  }, [feed]);
  useEffect(() => { void load(1); }, [load]);
  async function toggle(post: Post, kind: "reaction" | "bookmark") {
    const active = kind === "reaction" ? post.viewer.reacted : post.viewer.bookmarked;
    const key = `${kind}:${post.id}`; setBusy(key); setMessage("");
    setPosts((items) => items.map((item) => item.id !== post.id ? item : { ...item, viewer: { ...item.viewer, ...(kind === "reaction" ? { reacted: !active } : { bookmarked: !active }) }, _count: { ...item._count, ...(kind === "reaction" ? { reactions: Math.max(0, item._count.reactions + (active ? -1 : 1)) } : { bookmarks: Math.max(0, item._count.bookmarks + (active ? -1 : 1)) }) } }));
    const response = await fetch(`/api/posts/${post.id}/${kind === "reaction" ? "reactions" : "bookmark"}`, { method: active ? "DELETE" : "POST", headers: kind === "reaction" && !active ? { "Content-Type": "application/json" } : undefined, body: kind === "reaction" && !active ? JSON.stringify({ type: "LIKE" }) : undefined });
    if (!response.ok) { await load(page); setMessage("That action could not be saved. Please sign in and try again."); }
    setBusy(null);
  }
  return <section className="feed" aria-labelledby="feed-title"><header className="feed-header"><div><p className="eyebrow">The commons</p><h2 id="feed-title">Technology discussions</h2></div><div role="tablist" aria-label="Feed views" className="feed-tabs"><button type="button" role="tab" aria-selected={feed === "latest"} className={feed === "latest" ? "button-primary" : "button-outline"} onClick={() => setFeed("latest")}>Latest</button><button type="button" role="tab" aria-selected={feed === "following"} className={feed === "following" ? "button-primary" : "button-outline"} onClick={() => setFeed("following")}>Following</button><button type="button" role="tab" aria-selected={feed === "trending"} className={feed === "trending" ? "button-primary" : "button-outline"} onClick={() => setFeed("trending")}>Trending</button></div></header>{message && <p role="alert" className="feed-message">{message}</p>}{state === "loading" && !posts.length && <div className="feed-skeletons" aria-label="Loading discussions"><i/><i/><i/></div>}{state === "empty" && <div className="panel feed-empty"><h3>{feed === "following" ? "Your following feed is quiet." : feed === "trending" ? "Nothing is trending yet." : "No discussions yet."}</h3><p>{feed === "following" ? "Follow people whose work you want to keep up with, or switch to Latest to discover the community." : feed === "trending" ? "Trending discussions emerge from real replies and reactions. Start a thoughtful discussion to build momentum." : "Start a thoughtful discussion and give the community somewhere useful to respond."}</p></div>}{state === "error" && <button type="button" className="button-outline" onClick={() => void load(1)}>Try again</button>}<div className="feed-list">{posts.map((post) => <article key={post.id} className="feed-card"><div className="feed-card-meta"><span className="badge">{post.type.toLowerCase()}</span><Link href={`/spaces/${post.space.slug}`}>{post.space.name}</Link></div><h3><Link href={`/posts/${post.id}`}>{post.title}</Link></h3><p>{post.body}</p><footer><Link href={`/people/${post.author.username}`}>By {post.author.displayName}</Link><div><button type="button" aria-pressed={post.viewer.reacted} disabled={busy === `reaction:${post.id}`} onClick={() => void toggle(post, "reaction")}>{post.viewer.reacted ? "♥" : "♡"} {post._count.reactions}</button><Link href={`/posts/${post.id}#replies`}>Reply {post._count.replies}</Link><button type="button" aria-pressed={post.viewer.bookmarked} disabled={busy === `bookmark:${post.id}`} onClick={() => void toggle(post, "bookmark")}>{post.viewer.bookmarked ? "Saved" : "Save"} {post._count.bookmarks}</button></div></footer></article>)}</div>{more && <button type="button" className="button-outline" onClick={() => void load(page + 1)} disabled={state === "loading"}>Load more discussions</button>}</section>;
}
