import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionNav } from "@/components/session-nav";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [["Community", "/feed"], ["Spaces", "/spaces"], ["Knowledge", "/knowledge"], ["Explore", "/explore"], ["AI assistance", "/ai"]] as const;
const utility = [["Home", "/"], ["Notifications", "/notifications"], ["Profile", "/profile"]] as const;

export async function ProductNav() {
  const session = await auth();
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { displayName: true, username: true, avatarUrl: true } }) : null;
  const unreadCount = session?.user?.id ? await prisma.notification.count({ where: { userId: session.user.id, readAt: null } }) : 0;
  return <><a className="skip-link" href="#main-content">Skip to main content</a><header className="product-header"><Link href="/" className="product-brand" aria-label="Pnyx home"><Image src="/brand/pnyx-mark.svg" alt="" width={32} height={32} priority/><span>PNYX</span></Link><form className="shell-search" action="/explore" method="get"><label><span className="sr-only">Search Pnyx</span><input name="q" placeholder="Search Pnyx" /></label></form><div className="product-actions"><ThemeToggle/><SessionNav user={user} unreadCount={unreadCount}/></div></header><aside className="shell-sidebar" aria-label="Application navigation"><div className="shell-sidebar-group"><p className="shell-label">Workspace</p>{utility.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div><Link href="/feed" className="button-primary shell-create">Create a discussion</Link></aside><aside className="shell-context" aria-label="Contextual navigation"><p className="shell-label">Keep exploring</p><Link href="/knowledge"><strong>Knowledge library</strong><span>Guides, answers, research, and sources.</span></Link><Link href="/explore"><strong>Find a signal</strong><span>Search public technology conversations.</span></Link><Link href="/ai"><strong>AI assistance</strong><span>Summarize and connect selected discussions.</span></Link></aside><nav className="shell-mobile-nav" aria-label="Mobile navigation">{links.slice(0, 4).map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav></>;
}
