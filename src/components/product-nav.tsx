import Image from "next/image";
import Link from "next/link";

const links = [
  ["Community", "/feed"],
  ["Spaces", "/spaces"],
  ["Knowledge", "/knowledge"],
  ["Explore", "/explore"],
  ["AI assistance", "/ai"],
] as const;

export function ProductNav() {
  return <header className="product-header"><Link href="/" className="product-brand" aria-label="Pnyx home"><Image src="/brand/pnyx-mark.svg" alt="" width={32} height={32} priority/><span>PNYX</span></Link><nav className="product-nav" aria-label="Primary navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="product-actions"><Link href="/notifications" className="product-icon-link" aria-label="Notifications">Notifications</Link><Link href="/profile" className="product-icon-link">Profile</Link><Link href="/sign-in" className="product-signin">Sign in</Link></div></header>
}