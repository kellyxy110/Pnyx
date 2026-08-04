import Link from "next/link";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { KnowledgeBrowser } from "@/components/knowledge-browser";

export default async function KnowledgePage() {
  const session = await auth();
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="surface-hero"><p className="eyebrow">Knowledge library</p><h1>Ideas that outlive the thread.</h1><p>Read guides, answers, research notes, benchmarks, and case studies with their sources, contributors, and revision history intact.</p>{session && <Link href="/knowledge/new" className="button-primary mt-4 inline-flex">+ Create knowledge</Link>}</section><section className="surface-section"><KnowledgeBrowser/></section></main>;
}
