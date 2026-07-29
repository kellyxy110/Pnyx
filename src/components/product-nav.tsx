import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionNav } from "@/components/session-nav";

const links = [["Community", "/feed"], ["Spaces", "/spaces"], ["Knowledge", "/knowledge"], ["Explore", "/explore"], ["AI assistance", "/ai"]] as const;

export async function ProductNav() {
  const session = await auth();
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { displayName: true, username: true, avatarUrl: true } }) : null;
  const unreadCount = session?.user?.id ? await prisma.notification.count({ where: { userId: session.user.id, readAt: null } }) : 0;
  return <><a className="skip-link" href="#main-content">Skip to main content</a><header className="product-header"><Link href="/" className="product-brand" aria-label="Pnyx home"><Image src="/brand/pnyx-mark.svg" alt="" width={32} height={32} priority/><span>PNYX</span></Link><nav className="product-nav" aria-label="Primary navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav><div className="product-actions"><SessionNav user={user} unreadCount={unreadCount}/></div></header></>;
}
