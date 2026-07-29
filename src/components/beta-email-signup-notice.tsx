"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function BetaEmailSignupNotice() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/auth/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((config) => setEnabled(config.emailSignupEnabled === true))
      .catch(() => setEnabled(false));
  }, []);
  if (enabled !== false) return null;
  return <aside className="beta-auth-notice" aria-label="Closed beta signup notice">
    <strong>Closed beta registration</strong>
    <p>Email signup is temporarily limited while Pnyx is in closed beta. Use Google or GitHub above to create your account.</p>
    <Link href="/sign-in">Already have an account? Sign in</Link>
  </aside>;
}

