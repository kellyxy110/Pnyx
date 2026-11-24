import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProductNav } from "@/components/product-nav";
import { PasswordSetupForm } from "@/components/password-setup-form";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?returnTo=/account/password");
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav /><section className="surface-section"><p className="eyebrow">Account security</p><h1 className="mb-5 text-5xl font-bold tracking-[-.06em] text-[#0B1F3A] sm:text-7xl">Create a password.</h1><p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">Google and GitHub accounts can also use email and password sign-in after you create a password here.</p><PasswordSetupForm /><p className="mt-6 text-sm text-slate-600"><Link className="font-bold text-[#2563EB]" href="/profile">Back to your profile</Link></p></section></main>;
}
