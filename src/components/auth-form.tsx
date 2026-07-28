"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function SignInForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false });
    if (result?.error) setError("Those details could not be verified. Check your email and password, and confirm your email address.");
    else window.location.assign("/spaces");
    setBusy(false);
  }
  return <form onSubmit={submit} className="mx-auto grid w-full max-w-md gap-5" noValidate>
    <label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Email<input name="email" type="email" autoComplete="email" required className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label>
    <label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Password<input name="password" type="password" autoComplete="current-password" minLength={12} required className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label>
    <p className="text-right text-sm"><Link className="font-bold text-[#2563EB]" href="/forgot-password">Forgot your password?</Link></p>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <button disabled={busy} className="rounded-full bg-[#0B1F3A] px-5 py-3 font-bold text-white hover:bg-[#2563EB] disabled:cursor-wait disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    <p className="text-center text-sm text-slate-600">New to Pnyx? <Link className="font-bold text-[#2563EB]" href="/sign-up">Create an account</Link></p>
  </form>;
}

export function SignUpForm() {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/account/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "We could not create the account."); else { setMessage(result.message); event.currentTarget.reset(); }
    setBusy(false);
  }
  return <form onSubmit={submit} className="mx-auto grid w-full max-w-md gap-5" noValidate>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Display name<input name="displayName" required minLength={2} maxLength={80} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label><label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Username<input name="username" required pattern="[a-z0-9_]+" minLength={3} maxLength={30} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label></div>
    <label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Email<input name="email" type="email" autoComplete="email" required className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label>
    <label className="grid gap-2 text-sm font-semibold text-[#0B1F3A]">Password <span className="font-normal text-slate-500">12 characters minimum</span><input name="password" type="password" autoComplete="new-password" minLength={12} required className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" /></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{message}</p>}
    <button disabled={busy} className="rounded-full bg-[#0B1F3A] px-5 py-3 font-bold text-white hover:bg-[#2563EB] disabled:cursor-wait disabled:opacity-60">{busy ? "Creating account…" : "Create account"}</button>
    <p className="text-center text-sm text-slate-600">Already a member? <Link className="font-bold text-[#2563EB]" href="/sign-in">Sign in</Link></p>
  </form>;
}
