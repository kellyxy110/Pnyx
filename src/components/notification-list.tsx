"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { id: string; title: string; body: string; href: string | null; readAt: string | null };

export function NotificationList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  async function mark(id?: string) {
    setMessage("");
    const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }) });
    if (!response.ok) { setMessage("Notifications could not be updated. Please try again."); return; }
    setItems((current) => current.map((item) => id && item.id !== id ? item : { ...item, readAt: new Date().toISOString() }));
  }
  const unread = items.filter((item) => !item.readAt).length;
  return <div className="notification-list">{message && <p className="auth-error" role="alert">{message}</p>}{unread > 0 && <div className="flex justify-end"><button type="button" className="button-outline" onClick={() => void mark()}>Mark all as read</button></div>}{items.length ? items.map((item) => <article key={item.id} className={`panel notification-item ${item.readAt ? "" : "unread"}`}><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-[var(--muted)]">{item.body}</p>{item.href && <Link className="mt-2 inline-block text-[var(--blue)]" href={item.href}>Open discussion →</Link>}</div>{!item.readAt && <button type="button" className="notification-mark" onClick={() => void mark(item.id)}>Mark read</button>}</article>) : <p className="panel">You’re all caught up. New replies, mentions, follows, and moderation updates will appear here.</p>}</div>;
}
