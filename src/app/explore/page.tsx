import { ProductNav } from "@/components/product-nav";
import { SearchBrowser } from "@/components/search-browser";

export default function ExplorePage(){return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="surface-hero compact"><p className="eyebrow">Explore</p><h1>Find the signal in the noise.</h1><p>Search public discussions, replies, Spaces, people, and knowledge artifacts. Results explain what they are and where they belong.</p></section><SearchBrowser/></main>}