import Link from "next/link";

export default function NotFound() {
  return <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--ink)]">
    <div className="mx-auto grid max-w-2xl gap-6">
      <Link href="/" className="font-bold tracking-[.22em] text-[var(--navy)]">PNYX</Link>
      <p className="eyebrow">404</p>
      <h1 className="text-4xl font-bold tracking-tight">That page is not in the commons.</h1>
      <p className="help max-w-xl">The link may be outdated, or the discussion may no longer be available. Continue from a known Pnyx destination.</p>
      <nav aria-label="Helpful navigation" className="flex flex-wrap gap-3">
        <Link className="button-primary" href="/feed">Open Community</Link>
        <Link className="button-outline" href="/explore">Explore Pnyx</Link>
        <Link className="button-outline" href="/spaces">Browse Spaces</Link>
      </nav>
    </div>
  </main>;
}
