import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileEditor } from "@/components/profile-editor";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() { const session = await auth(); if (!session?.user?.id) redirect("/sign-in?returnTo=/profile"); return <main className="min-h-screen bg-[#F8FAFC] px-5 py-10 sm:px-10"><div className="mx-auto max-w-6xl"><header className="mb-16 flex items-center justify-between"><Link href="/" className="font-bold tracking-[.22em] text-[#0B1F3A]">PNYX</Link><div className="flex items-center gap-3"><a href="/spaces" className="text-sm font-bold text-[#2563EB]">Browse Spaces</a><SignOutButton /></div></header><section><p className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#2563EB]">Your knowledge identity</p><h1 className="mb-5 text-5xl font-bold tracking-[-.06em] text-[#0B1F3A] sm:text-7xl">Make your perspective findable.</h1><p className="mb-12 max-w-2xl text-lg leading-8 text-slate-600">Tell the community what you build, study, and understand. You can change these choices any time.</p><ProfileEditor /></section></div></main>; }
