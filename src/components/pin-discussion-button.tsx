"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PinDiscussionButton({ slug, postId, initialPinned }: { slug: string; postId: string; initialPinned: boolean }) {
  const router = useRouter();
  const [pinned, setPinned] = useState(initialPinned);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function toggle() {
    const previous = pinned;
    setPinned(!previous); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/spaces/${slug}/pinned`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, pinned: !previous }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Could not update pin.");
      setMessage(!previous ? "Pinned." : "Unpinned."); router.refresh();
    } catch (error) { setPinned(previous); setMessage(error instanceof Error ? error.message : "Could not update pin."); }
    finally { setBusy(false); }
  }
  return <span><button type="button" className="button-outline" disabled={busy} onClick={() => void toggle()} aria-pressed={pinned}>{busy ? "Saving…" : pinned ? "Unpin" : "Pin"}</button>{message && <span className="sr-only" role="status">{message}</span>}</span>;
}