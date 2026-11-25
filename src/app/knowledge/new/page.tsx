import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { KnowledgeEditor } from "@/components/knowledge-editor";

export const dynamic = "force-dynamic";

export default async function NewKnowledgePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?returnTo=/knowledge/new");
  return <main id="main-content" tabIndex={-1} className="app-shell workspace-focused"><ProductNav focused/><section className="surface-section"><p className="eyebrow">Contribute to the commons</p><h1>Create knowledge</h1><p className="help mt-2 max-w-2xl">Share a guide, answer, or research note. Start with a private draft; add sources and publish when you’re ready.</p><KnowledgeEditor/><p className="mt-6 text-sm text-[var(--muted)]"><Link href="/knowledge" className="text-[var(--blue)]">← Back to the Knowledge library</Link></p></section></main>;
}
