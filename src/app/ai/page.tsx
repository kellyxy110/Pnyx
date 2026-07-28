import Link from "next/link";
import { ProductNav } from "@/components/product-nav";

const capabilities = [
  ["Understand", "Summarize a public discussion and preserve the source context."],
  ["Connect", "Find related discussions and documentation without exposing private content."],
  ["Draft", "Turn a selected discussion into an editable knowledge artifact draft."],
  ["Improve", "Give feedback, report issues, or disable AI assistance at any time."],
] as const;

export default function AiPage() {
  return <main className="app-shell"><ProductNav/><section className="surface-hero"><p className="eyebrow">AI assistance</p><h1>Make useful knowledge easier to find.</h1><p>AI works quietly beside the community: it can summarize, connect, and draft from selected public material. People review and own the final contribution.</p><div className="surface-actions"><Link className="button-primary" href="/feed">Open a discussion</Link><Link className="button-outline" href="/knowledge">Browse knowledge</Link></div></section><section className="surface-section" aria-labelledby="ai-capabilities"><div className="section-heading"><div><p className="eyebrow">Designed for trust</p><h2 id="ai-capabilities">What AI can help with</h2></div><p>Every output is labeled, attributable, editable, and open to correction.</p></div><div className="capability-grid">{capabilities.map(([title,description], index) => <article className="capability-card" key={title}><span className="capability-index">0{index+1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section><section className="ai-guidance"><div><p className="eyebrow">Human in the loop</p><h2>AI suggests. The commons decides.</h2><p>Generated material is never presented as a verified answer by default. Review sources, edit the draft, and report anything that needs correction.</p></div><Link className="text-link" href="/docs/ai-disclosure">Read the AI disclosure →</Link></section></main>
}