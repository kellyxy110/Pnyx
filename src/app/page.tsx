import Image from "next/image";
import Link from "next/link";

const pathways = [
  ["Community", "Start a thoughtful discussion, ask a question, or share work with people who build.", "/feed", "Join the conversation"],
  ["Spaces", "Find focused technology communities with their own people, rules, and shared context.", "/spaces", "Browse Spaces"],
  ["Knowledge", "Turn useful discussions into durable guides, answers, research notes, and case studies.", "/knowledge", "Explore knowledge"],
  ["Explore", "Find people, public conversations, Spaces, and knowledge that match what you are working on.", "/explore", "Discover Pnyx"],
] as const;

function Brand({ footer = false }: { footer?: boolean }) {
  return <Link className={footer ? "footer-brand" : "brand-lockup"} href="/" aria-label="Pnyx home"><Image src="/brand/pnyx-mark.svg" alt="" width={footer ? 32 : 42} height={footer ? 32 : 42} priority /><span>Pnyx</span></Link>;
}

export default function HomePage() {
  return <main className="site-shell landing-shell">
    <nav className="topbar landing-topbar" aria-label="Primary navigation">
      <Brand />
      <div className="nav-links"><a href="#how-it-works">How Pnyx works</a><a href="#pathways">Explore</a><a href="#community">Community</a></div>
      <div className="landing-nav-actions"><Link className="landing-signin" href="/sign-in">Sign in</Link><Link className="button button-primary" href="/sign-up">Join Pnyx</Link></div>
    </nav>

    <section className="landing-hero" aria-labelledby="hero-title">
      <div className="landing-hero-copy">
        <p className="eyebrow">A technology knowledge network</p>
        <h1 id="hero-title">Technology moves faster when people <em>build together.</em></h1>
        <p className="hero-copy">Pnyx is a home for curious builders, engineers, researchers, and creators. Start a conversation, find your people, and turn what you learn into knowledge that lasts.</p>
        <div className="hero-actions"><Link className="button button-primary" href="/sign-up">Create your Pnyx account</Link><Link className="text-link" href="/feed">Explore the community <span aria-hidden="true">→</span></Link></div>
        <p className="landing-hero-note">Join with Google or GitHub, then shape a technology identity around what you learn, build, and share.</p>
      </div>
      <div className="landing-visual" id="community">
        <div className="landing-visual-glow" aria-hidden="true" />
        <Image className="landing-community-image" src="/images/pnyx-community-collage.png" alt="A diverse community of technology builders and creators" width={1250} height={1250} priority sizes="(max-width: 900px) 92vw, 52vw" />
        <div className="landing-visual-card landing-visual-card-top"><span className="landing-card-icon" aria-hidden="true">✦</span><div><strong>Shared context</strong><span>Conversations connect to knowledge.</span></div></div>
        <div className="landing-visual-card landing-visual-card-bottom"><span className="landing-card-icon" aria-hidden="true">↗</span><div><strong>Made for contribution</strong><span>Questions, research, ideas, and useful work.</span></div></div>
      </div>
    </section>

    <section className="landing-trust" aria-label="Pnyx community principles">
      <p>Built for people who care about technology.</p><span>Ask with context</span><span>Learn in public</span><span>Make knowledge useful</span><span>Give credit clearly</span>
    </section>

    <section className="landing-how" id="how-it-works" aria-labelledby="how-title">
      <div className="landing-section-intro"><p className="eyebrow">More than a feed</p><h2 id="how-title">A better place for the work behind the work.</h2><p>Pnyx keeps the human part of technology visible: the questions, explanations, sources, experiments, and people that make progress possible.</p></div>
      <div className="landing-flow" role="list">
        <article role="listitem"><span>01</span><h3>Start a conversation</h3><p>Ask a focused question, share an idea, or publish what you are learning.</p></article>
        <article role="listitem"><span>02</span><h3>Find people and Spaces</h3><p>Follow contributors and join communities where the right context already exists.</p></article>
        <article role="listitem"><span>03</span><h3>Keep what matters</h3><p>Carry the strongest thinking forward as readable, attributed knowledge.</p></article>
      </div>
    </section>

    <section className="landing-pathways" id="pathways" aria-labelledby="pathways-title">
      <div className="landing-section-intro"><p className="eyebrow">Find your way in</p><h2 id="pathways-title">One network. Many ways to contribute.</h2></div>
      <div className="landing-pathway-grid">{pathways.map(([title, body, href, label], index) => <article className="landing-pathway-card" key={title}><span className="landing-pathway-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p><Link className="text-link" href={href}>{label} <span aria-hidden="true">→</span></Link></article>)}</div>
    </section>

    <section className="landing-cta" aria-labelledby="cta-title">
      <div><p className="eyebrow">The commons is open</p><h2 id="cta-title">Bring your next question.</h2><p>Whether you are learning, shipping, researching, or looking for collaborators, there is a place to begin on Pnyx.</p></div>
      <div className="landing-cta-actions"><Link className="button button-primary" href="/sign-up">Join Pnyx</Link><Link className="text-link" href="/sign-in">I already have an account</Link></div>
    </section>

    <footer><Brand footer /><span>Where technology conversations become organised knowledge.</span></footer>
  </main>;
}