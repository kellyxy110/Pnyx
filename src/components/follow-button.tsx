"use client";

import { useState } from "react";

export function FollowButton({ userId, initialFollowing, initialFollowers }: { userId: string; initialFollowing: boolean; initialFollowers: number }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function change() {
    const next = !following;
    setFollowing(next); setFollowers((value) => Math.max(0, value + (next ? 1 : -1))); setBusy(true); setError("");
    const response = await fetch(`/api/users/${userId}/follow`, { method: next ? "POST" : "DELETE" });
    const result = await response.json().catch(() => null);
    if (!response.ok) { setFollowing(!next); setFollowers((value) => Math.max(0, value + (next ? -1 : 1))); setError(result?.error ?? "We could not update this follow." ); }
    else { setFollowing(Boolean(result.following)); setFollowers(Number(result.followers)); }
    setBusy(false);
  }
  return <div className="follow-control"><button type="button" onClick={() => void change()} disabled={busy} className={following ? "button-outline" : "button-primary"} aria-pressed={following}>{busy ? "Updating…" : following ? "Following" : "Follow"}</button><span>{followers} follower{followers === 1 ? "" : "s"}</span>{error && <p role="alert">{error}</p>}</div>;
}