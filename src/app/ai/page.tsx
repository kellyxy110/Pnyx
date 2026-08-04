import Link from "next/link";
import { ProductNav } from "@/components/product-nav";
import { AiPreferences } from "@/components/ai-preferences";

const capabilities = [
  ["Summarize a discussion", "Open a public discussion and create a clearly labeled, source-bound summary.", "/feed"],
  ["Find related knowledge", "Use a discussion’s AI panel to surface related public discussions and source-search suggestions.", "/feed"],
  ["Draft knowledge", "Create an editable knowledge draft from selected public discussion material—never a verified article by default.", "/knowledge"],
  ["Control AI assistance", "Review feedback options or turn off AI assistance for your account at any time.", "#ai-preferences"],
] as const;

export default function AiPage() {
  return <main id="main-content" tabIndex={-1} className="app-shell">
    <ProductNav />
    <section className="surface-hero">
      <p className="eyebrow">AI assistance</p>
      <h1>Use AI where the conversation happens.</h1>
      <p>Pnyx AI works beside public discussions. It can create source-bound suggestions, find related material, and help prepare knowledge drafts. People review and own the final contribution.</p>
      <div className="surface-actions"><Link className="button-primary" href="/feed">Open Community</Link><Link className="button-outline" href="/knowledge">Browse knowledge</Link></div>
    </section>
    <section id="ai-preferences" className="surface-section"><AiPreferences /></section>
    <section className="surface-section" aria-labelledby="ai-capabilities">
      <div className="section-heading"><div><p className="eyebrow">Available now</p><h2 id="ai-capabilities">Supported AI actions</h2></div><p>Every output is labeled, attributable, editable, and open to correction.</p></div>
      <div className="capability-grid">{capabilities.map(([title, description, href], index) => <article className="capability-card" key={title}><span className="capability-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p><Link className="text-link" href={href}>Use this action →</Link></article>)}</div>
    </section>
    <section className="ai-guidance"><div><p className="eyebrow">Human in the loop</p><h2>AI suggests. The commons decides.</h2><p>Generated material is never presented as a verified answer by default. Review sources, edit the draft, and report anything that needs correction.</p></div><Link className="text-link" href="/docs/ai-disclosure">Read the AI disclosure →</Link></section>
  </main>;
}