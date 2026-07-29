import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionNav } from "@/components/session-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppNavigation } from "@/components/app-navigation";

export async function ProductNav() {
  const session = await auth();
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { displayName: true, username: true, avatarUrl: true } }) : null;
  const unreadCount = session?.user?.id ? await prisma.notification.count({ where: { userId: session.user.id, readAt: null } }) : 0;
  return <><a className="skip-link" href="#main-content">Skip to main content</a><header className="product-header"><Link href="/" className="product-brand" aria-label="Pnyx home"><Image src="/brand/pnyx-mark.svg" alt="" width={32} height={32} priority/><span>PNYX</span></Link><form className="shell-search" action="/explore" method="get"><label><span className="sr-only">Search Pnyx</span><input name="q" placeholder="Search Pnyx" /></label></form><div className="product-actions"><ThemeToggle/><SessionNav user={user} unreadCount={unreadCount}/></div></header><AppNavigation/><aside className="shell-context" aria-label="Contextual navigation"><p className="shell-label">Keep exploring</p><Link href="/knowledge"><strong>Knowledge library</strong><span>Guides, answers, research, and sources.</span></Link><Link href="/explore"><strong>Find a signal</strong><span>Search public technology conversations.</span></Link><Link href="/ai"><strong>AI assistance</strong><span>Summarize and connect selected discussions.</span></Link></aside></>;
}
