import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { ProfileEditor } from "@/components/profile-editor";
import { ProfileNetwork } from "@/components/profile-network";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?returnTo=/profile");
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="surface-section"><header className="mb-12"><p className="eyebrow">Your knowledge identity</p><h1 className="mb-5 text-5xl font-bold tracking-[-.06em] text-[#0B1F3A] sm:text-7xl">Make your perspective findable.</h1><p className="max-w-2xl text-lg leading-8 text-slate-600">Tell the community what you build, study, and understand. Your profile is the home for your contributions.</p></header><ProfileEditor/><ProfileNetwork/><p className="mt-6 text-sm text-[var(--muted)]"><Link href="/feed" className="text-[var(--blue)]">Return to the community feed →</Link></p></section></main>;
}
