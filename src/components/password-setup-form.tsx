"use client";

import { FormEvent, useState } from "react";

export function PasswordSetupForm() {
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget); const password = String(form.get("password") ?? ""); const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (password.length < 12) { setError("Password must be at least 12 characters."); setBusy(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setBusy(false); return; }
    try { const response = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.get("currentPassword") || undefined, password, confirmPassword }) }); const result = await response.json().catch(() => null); if (!response.ok) setError(result?.error ?? "Password could not be saved."); else { setMessage(result.message); event.currentTarget.reset(); } } catch { setError("Password could not be saved. Please try again."); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="profile-form" noValidate><section><label>Current password <span className="font-normal text-slate-500">Required only if you already have one</span><input name="currentPassword" type="password" autoComplete="current-password" /></label><label>New password <span className="font-normal text-slate-500">At least 12 characters</span><input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label>{error && <p className="profile-message error" role="alert">{error}</p>}{message && <p className="profile-message success" role="status">{message}</p>}<button className="button-primary profile-save" disabled={busy}>{busy ? "Saving password…" : "Save password"}</button></section></form>;
}
