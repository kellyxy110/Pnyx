"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

type User = { displayName: string; username: string; avatarUrl: string | null };

function initials(user: User) {
  return user.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || user.username.slice(0, 2).toUpperCase();
}

export function SessionNav({ user, unreadCount }: { user: User | null; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return <div className="product-session">
    <Link href="/notifications" className="product-notification" aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}>
      <span aria-hidden="true">♧</span>{unreadCount > 0 && <b>{unreadCount > 9 ? "9+" : unreadCount}</b>}
    </Link>
    {user ? <div className="product-user-menu">
      <button type="button" className="product-user-trigger" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
        {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={36} height={36} className="product-avatar" /> : <span className="product-avatar product-avatar-fallback" aria-hidden="true">{initials(user)}</span>}
        <span className="product-user-copy"><strong>{user.displayName}</strong><small>@{user.username}</small></span><span aria-hidden="true">⌄</span>
      </button>
      {open && <div className="product-user-popover" role="menu">
        <Link href="/profile" role="menuitem" onClick={() => setOpen(false)}>View profile</Link>
        <Link href="/notifications" role="menuitem" onClick={() => setOpen(false)}>Notifications{unreadCount ? ` (${unreadCount})` : ""}</Link>
        <button type="button" role="menuitem" disabled={busy} onClick={() => { setBusy(true); void signOut({ callbackUrl: "/" }); }}>{busy ? "Signing out…" : "Sign out"}</button>
      </div>}
    </div> : <div className="product-auth-actions"><Link href="/sign-in" className="product-signin">Sign in</Link><Link href="/sign-up" className="button-primary product-join">Join Pnyx</Link></div>}
  </div>;
}
