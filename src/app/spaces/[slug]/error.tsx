"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SpaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Space route failed", { message: error.message, digest: error.digest }); }, [error]);
  return <main className="app-shell"><section className="surface-section"><div className="panel space-route-error" role="alert"><p className="eyebrow">Space unavailable</p><h1>We could not open this Space.</h1><p className="help">Your membership and discussions are safe. Try loading the Space again, or return to the Spaces directory.</p><div className="space-detail-actions"><button type="button" className="button-primary" onClick={() => reset()}>Try again</button><Link className="button-outline" href="/spaces">Browse Spaces</Link></div></div></section></main>;
}
