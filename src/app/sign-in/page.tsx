import Link from "next/link";
import { SignInForm } from "@/components/auth-form";

export default function SignInPage() { return <main className="min-h-screen bg-[#F8FAFC] px-5 py-12 sm:py-20"><div className="mx-auto max-w-3xl"><Link href="/" className="font-bold tracking-[.22em] text-[#0B1F3A]">PNYX</Link><section className="mt-20"><p className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#2563EB]">Welcome back</p><h1 className="mb-5 text-5xl font-bold tracking-[-.06em] text-[#0B1F3A] sm:text-7xl">Continue the conversation.</h1><p className="mb-10 max-w-xl text-lg leading-8 text-slate-600">Sign in to follow Spaces, contribute knowledge, and keep your technology trail together.</p><SignInForm /></section></div></main>; }
