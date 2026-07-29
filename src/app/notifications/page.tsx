import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductNav } from "@/components/product-nav";
import { NotificationList } from "@/components/notification-list";

export const dynamic = "force-dynamic";

export default async function Notifications() {
  const session = await auth();
  if (!session?.user?.id) return <main className="app-shell"><ProductNav/><section className="surface-section"><div className="panel"><h1 className="text-2xl font-semibold">Your notifications</h1><p className="mt-2">Sign in to keep track of replies, mentions, follows, and moderation updates.</p><Link className="button-primary mt-4 inline-flex" href="/sign-in?callbackUrl=/notifications">Sign in</Link></div></section></main>;
  const items = await prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 40, select: { id: true, title: true, body: true, href: true, readAt: true, createdAt: true } });
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav/><section className="notifications-shell"><header className="surface-hero compact"><p className="eyebrow">Inbox</p><h1>Stay close to the commons.</h1><p>Follow useful threads, respond to mentions, and keep moderation decisions visible without chasing them through your feed.</p></header><div className="notification-toolbar mb-5"><h2 className="text-2xl font-semibold text-[var(--navy)]">Recent updates</h2></div><NotificationList initialItems={items.map((item) => ({ ...item, readAt: item.readAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() }))}/></section></main>;
}
