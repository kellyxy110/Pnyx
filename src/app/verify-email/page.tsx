"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function VerifyEmailPage() {
  const [state, setState] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("Confirming your email address…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    fetch("/api/account/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "That verification link is invalid or expired.");
        setState("success");
        setMessage(result.message);
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(error instanceof Error ? error.message : "We could not verify your email. Please try again.");
      });
  }, []);

  return (
    <AuthShell mode="sign-in">
      <section className="auth-form auth-status-card" aria-live="polite" aria-busy={state === "checking"}>
        <p className="auth-kicker">Email verification</p>
        <h1>{state === "checking" ? "Confirming your email" : state === "success" ? "You’re verified" : "Verification link issue"}</h1>
        <p className={state === "error" ? "auth-error" : state === "success" ? "auth-success" : "auth-form-note"}>{message}</p>
        {state === "success" && <Link className="auth-submit auth-submit-link" href="/sign-in">Continue to sign in</Link>}
        {state === "error" && <Link className="auth-submit auth-submit-link" href="/sign-up">Return to sign up</Link>}
      </section>
    </AuthShell>
  );
}