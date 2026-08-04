"use client";

import { useToggleAction } from "@/lib/use-toggle-action";

export function FollowButton({ userId, initialFollowing, initialFollowers }: { userId: string; initialFollowing: boolean; initialFollowers: number }) {
  const { active: following, count: followers, busy, error, toggle } = useToggleAction({
    url: `/api/users/${userId}/follow`,
    initialActive: initialFollowing,
    initialCount: initialFollowers,
    parseResponse: (json) => {
      const data = json as { following: boolean; followers: number };
      return { active: data.following, count: data.followers };
    },
    signInReturnTo: `/people`,
    errorMessage: "We could not update this follow.",
  });

  return (
    <div className="follow-control">
      <button type="button" onClick={() => toggle()} disabled={busy} className={following ? "button-outline" : "button-primary"} aria-pressed={following}>
        {busy ? "Updating…" : following ? "Following" : "Follow"}
      </button>
      <span>{followers} follower{followers === 1 ? "" : "s"}</span>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
