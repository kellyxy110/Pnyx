"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [["Community", "/feed"], ["Spaces", "/spaces"], ["Knowledge", "/knowledge"], ["Explore", "/explore"], ["AI assistance", "/ai"]] as const;
const utility = [["Notifications", "/notifications"], ["Profile", "/profile"]] as const;

function current(pathname: string, href: string) { return pathname === href || (href !== "/feed" && pathname.startsWith(`${href}/`)); }

export function AppNavigation() {
  const pathname = usePathname();
  const all = [...utility, ...primary];
  return <>
    <aside className="shell-sidebar" aria-label="Application navigation">
      <div className="shell-sidebar-group"><p className="shell-label">Workspace</p>{all.map(([label, href]) => <Link href={href} key={href} aria-current={current(pathname, href) ? "page" : undefined} className={current(pathname, href) ? "is-active" : undefined}>{label}</Link>)}</div>
      <Link href="/feed#composer" className="button-primary shell-create">Create a discussion</Link>
    </aside>
    <nav className="shell-mobile-nav" aria-label="Mobile navigation">{primary.slice(0, 4).map(([label, href]) => <Link href={href} key={href} aria-current={current(pathname, href) ? "page" : undefined} className={current(pathname, href) ? "is-active" : undefined}>{label}</Link>)}</nav>
  </>;
}
