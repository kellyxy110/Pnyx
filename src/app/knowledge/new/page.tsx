import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { KnowledgeEditor } from "@/components/knowledge-editor";

export const dynamic = "force-dynamic";

export default async function NewKnowledgePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?returnTo=/knowledge/new");
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="surface-section"><p className="eyebrow">Contribute to the commons</p><h1>Create a knowledge artifact</h1><p className="help mt-2 max-w-2xl">Draft a guide, answer, research note, benchmark, or case study. Saved as a private draft first — add sources and publish from the artifact page.</p><KnowledgeEditor/><p className="mt-6 text-sm text-[var(--muted)]"><Link href="/knowledge" className="text-[var(--blue)]">← Back to the Knowledge library</Link></p></section></main>;
}
