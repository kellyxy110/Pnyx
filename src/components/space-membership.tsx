"use client";
import { useToggleAction } from "@/lib/use-toggle-action";

export function SpaceMembership({ slug, initialJoined, initialMembers }: { slug: string; initialJoined: boolean; initialMembers: number }) {
  const { active: joined, count: members, busy, error, toggle } = useToggleAction({
    url: `/api/spaces/${slug}/membership`,
    initialActive: initialJoined,
    initialCount: initialMembers,
    parseResponse: (json) => {
      const data = json as { joined: boolean; members: number };
      return { active: data.joined, count: data.members };
    },
    signInReturnTo: `/spaces/${slug}`,
    errorMessage: "Your membership could not be updated. Please try again.",
  });

  return (
    <div className="space-membership">
      <button className={joined ? "button-outline" : "button-primary"} type="button" onClick={() => toggle()} disabled={busy}>
        {busy ? "Saving…" : joined ? "Leave Space" : "Join Space"}
      </button>
      <span>{members} members</span>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
