import { Suspense } from "react";
import { ProductNav } from "@/components/product-nav";
import { SearchBrowser } from "@/components/search-browser";
import { ExploreDiscovery } from "@/components/explore-discovery";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  return <main id="main-content" tabIndex={-1} className="app-shell">
    <ProductNav />
    <SearchBrowser initialQuery={query} />
    <Suspense fallback={<p className="help" role="status">Loading the commons…</p>}><ExploreDiscovery /></Suspense>
  </main>;
}
