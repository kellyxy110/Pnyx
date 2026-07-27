import Link from "next/link";

const principles = [
  ["Conversation", "Ask questions, share work, and learn with people across technology."],
  ["Knowledge", "Turn strong discussions into durable, attributed guides and research."],
  ["Trust", "Make sources, contributors, review status, and expertise visible."],
];

export default function HomePage() {
  return <main className="site-shell">
    <nav className="topbar" aria-label="Primary navigation"><Link className="wordmark" href="/">Pnyx</Link><div className="nav-links"><a href="#principles">Why Pnyx</a><a href="#foundation">Foundation</a></div><a className="nav-action" href="#foundation">Explore the foundation</a></nav>
    <section className="hero" aria-labelledby="hero-title"><p className="eyebrow">A technology knowledge network</p><h1 id="hero-title">Where technology conversations become <em>organised knowledge.</em></h1><p className="hero-copy">Pnyx brings community, learning, research, and collaboration into one thoughtful home for people who build with technology.</p><div className="hero-actions"><a className="button button-primary" href="#principles">Discover the idea</a><a className="text-link" href="#foundation">See the foundation <span aria-hidden="true">↓</span></a></div></section>
    <section className="principles" id="principles" aria-labelledby="principles-title"><div><p className="eyebrow">The compounding loop</p><h2 id="principles-title">Useful ideas should not disappear into history.</h2></div><div className="principle-grid">{principles.map(([title, body], index) => <article className="principle" key={title}><span className="principle-number">0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="foundation" id="foundation" aria-labelledby="foundation-title"><div className="foundation-copy"><p className="eyebrow">The foundation is ready</p><h2 id="foundation-title">A calm, durable base for the community ahead.</h2><p>Typed boundaries, PostgreSQL persistence, privacy-aware telemetry, structured operations, and accessible design are in place for the next product loop.</p></div><div className="status-card" aria-label="Foundation capabilities"><div className="status-heading"><span className="status-dot" aria-hidden="true" />Foundation status</div><ul><li>Next.js + TypeScript application</li><li>Prisma + PostgreSQL data model</li><li>Health checks and structured logs</li><li>Accessible responsive design system</li></ul></div></section>
    <footer><span>Pnyx</span><span>Technology conversations, organised.</span></footer>
  </main>;
}
