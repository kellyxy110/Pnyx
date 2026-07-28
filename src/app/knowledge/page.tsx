import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { KnowledgeEditor } from "@/components/knowledge-editor";

export default async function KnowledgePage(){const session=await auth();return <main className="app-shell"><ProductNav/><section className="surface-hero"><p className="eyebrow">Knowledge library</p><h1>Ideas that outlive the thread.</h1><p>Read guides, answers, research notes, benchmarks, and case studies with their sources, contributors, and revision history intact.</p></section>{session&&<section className="surface-section"><KnowledgeEditor/></section>}<section className="surface-section"><KnowledgeBrowser/></section></main>}