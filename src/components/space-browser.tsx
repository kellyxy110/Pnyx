"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToggleAction } from "@/lib/use-toggle-action";

type Space = { id: string; slug: string; name: string; description: string; tags: string[]; isFeatured: boolean; viewer?: { joined: boolean; following: boolean; isModerator: boolean }; _count: { members: number; followers: number } };
type Tab = "featured" | "following" | "joined" | "all";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "following", label: "Following" },
  { key: "joined", label: "Joined" },
  { key: "all", label: "All Spaces" },
];

function SpaceBrowserCard({ space }: { space: Space }) {
  const router = useRouter();
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

  async function changeMembership() {
    if (membership.active) { await membership.toggle(); return; }
    const result = await membership.toggle();
    if (result?.active) router.push(`/spaces/${space.slug}`);
  }

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
          <button disabled={membership.busy} onClick={() => void changeMembership()} className="rounded-full bg-[#0B1F3A] px-3 py-2 font-bold text-white hover:bg-[#2563EB]">{membership.busy ? "Saving…" : membership.active ? "Leave" : "Join"}</button>
        </div>
      </div>
      {(follow.error || membership.error) && <p role="alert" className="mt-3 text-sm text-red-700">{follow.error || membership.error}</p>}
    </article>
  );
}

export function SpaceBrowser() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    fetch("/api/spaces").then(async (response) => {
      if (!response.ok) throw new Error();
      setSpaces(await response.json());
      setState("ready");
    }).catch(() => setState("error"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spaces.filter((space) => {
      if (tab === "featured" && !space.isFeatured) return false;
      if (tab === "following" && !space.viewer?.following) return false;
      if (tab === "joined" && !space.viewer?.joined) return false;
      if (!q) return true;
      return `${space.name} ${space.description} ${space.tags.join(" ")}`.toLowerCase().includes(q);
    });
  }, [spaces, tab, query]);

  if (state === "error") return <p role="alert" className="rounded-2xl bg-red-50 p-5 text-red-800">Spaces could not be loaded right now.</p>;

  return (
    <div className="grid gap-5">
      <label className="block">
        <span className="sr-only">Search Spaces</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Spaces" className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm text-[#0B1F3A] outline-none focus:border-[#2563EB]" />
      </label>
      <div role="tablist" aria-label="Space filters" className="flex flex-wrap gap-2">
        {TABS.map((t) => <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "button-primary" : "button-outline"}>{t.label}</button>)}
      </div>
      {state === "loading" && <div className="grid gap-4 md:grid-cols-2" aria-label="Loading Spaces"><div className="h-52 animate-pulse rounded-2xl bg-slate-100" /><div className="h-52 animate-pulse rounded-2xl bg-slate-100" /></div>}
      {state === "ready" && spaces.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">No public Spaces are available yet.</p>}
      {state === "ready" && spaces.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
          <h3 className="text-lg font-semibold text-[#0B1F3A]">No Spaces found</h3>
          <p className="mt-1">{tab === "all" ? "Try a different search term." : `You haven't ${tab === "joined" ? "joined" : "followed"} any Spaces that match yet.`}</p>
          {(query || tab !== "all") && <button type="button" className="button-outline mt-4" onClick={() => { setQuery(""); setTab("all"); }}>Clear filters</button>}
        </div>
      )}
      {filtered.length > 0 && <div className="grid gap-4 md:grid-cols-2">{filtered.map((space) => <SpaceBrowserCard key={space.id} space={space} />)}</div>}
    </div>
  );
}
