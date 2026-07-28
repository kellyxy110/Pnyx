"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return <button type="button" disabled={busy} onClick={() => { setBusy(true); void signOut({ callbackUrl: "/" }); }} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-[#0B1F3A] hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-60">{busy ? "Signing out…" : "Sign out"}</button>;
}
