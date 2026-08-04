"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToggleAction } from "@/lib/use-toggle-action";

type Space = { id: string; slug: string; name: string; description: string; tags: string[]; isFeatured: boolean; viewer?: { joined: boolean; following: boolean; isModerator: boolean }; _count: { members: number; followers: number } };

function SpaceBrowserCard({ space }: { space: Space }) {
  const follow = useToggleAction({
    url: `/api/spaces/${space.slug}/follow`,
    initialActive: space.viewer?.following ?? false,
    initialCount: space._count.followers,
    parseResponse: (json) => {
      const data = json as { following: boolean; followers: number };
      return { active: data.following, count: data.followers };
    },
    signInReturnTo: "/spaces",
    errorMessage: "Could not update this follow. Please try again.",
  });
  const membership = useToggleAction({
    url: `/api/spaces/${space.slug}/membership`,
    initialActive: space.viewer?.joined ?? false,
    initialCount: space._count.members,
    parseResponse: (json) => {
      const data = json as { joined: boolean; members: number };
      return { active: data.joined, count: data.members };
    },
    signInReturnTo: "/spaces",
    errorMessage: "Could not update this membership. Please try again.",
  });

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-[#2563EB]">{space.isFeatured ? "Featured Space" : "Space"}</p>
          <h2 className="text-2xl font-bold tracking-[-.04em] text-[#0B1F3A]"><Link href={`/spaces/${space.slug}`}>{space.name}</Link></h2>
        </div>
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-[#D4A017]" />
      </div>
      <p className="min-h-16 leading-7 text-slate-600">{space.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">{space.tags.map((tag) => <span key={tag} className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs text-slate-600">{tag}</span>)}</div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span>{membership.count} members · {follow.count} followers</span>
        <div className="flex gap-2">
          <button disabled={follow.busy} onClick={() => follow.toggle()} className="rounded-full border border-slate-300 px-3 py-2 font-bold text-[#0B1F3A] hover:border-[#2563EB] hover:text-[#2563EB]">{follow.busy ? "Saving…" : follow.active ? "Following" : "Follow"}</button>
          <button disabled={membership.busy} onClick={() => membership.toggle()} className="rounded-full bg-[#0B1F3A] px-3 py-2 font-bold text-white hover:bg-[#2563EB]">{membership.busy ? "Saving…" : membership.active ? "Leave" : "Join"}</button>
        </div>
      </div>
      {(follow.error || membership.error) && <p role="alert" className="mt-3 text-sm text-red-700">{follow.error || membership.error}</p>}
    </article>
  );
}

export function SpaceBrowser() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/spaces").then(async (response) => { if (!response.ok) throw new Error(); setSpaces(await response.json()); }).catch(() => setError("Spaces could not be loaded right now."));
  }, []);
  if (error) return <p role="alert" className="rounded-2xl bg-red-50 p-5 text-red-800">{error}</p>;
  if (!spaces.length) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No public Spaces are available yet.</p>;
  return <div className="grid gap-4 md:grid-cols-2">{spaces.map((space) => <SpaceBrowserCard key={space.id} space={space} />)}</div>;
}
