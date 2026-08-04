"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ToggleActionResult {
  active: boolean;
  count: number;
  busy: boolean;
  error: string;
  toggle: () => void;
}

interface UseToggleActionOptions {
  url: string;
  initialActive: boolean;
  initialCount: number;
  parseResponse: (json: unknown) => { active: boolean; count: number };
  signInReturnTo: string;
  errorMessage: string;
}

/**
 * Shared Join/Follow-style toggle state (one active/count pair backed by a
 * POST-to-activate / DELETE-to-deactivate endpoint). The server response is
 * always the source of truth for the resulting active flag and count — this
 * hook never computes a count by incrementing/decrementing on the client, so
 * it can't drift from the database no matter how many times it's tapped,
 * retried, or raced against another tab or device.
 */
export function useToggleAction({ url, initialActive, initialCount, parseResponse, signInReturnTo, errorMessage }: UseToggleActionOptions): ToggleActionResult {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    const method = active ? "DELETE" : "POST";
    try {
      const response = await fetch(url, { method });
      if (response.status === 401) {
        router.push(`/sign-in?returnTo=${encodeURIComponent(signInReturnTo)}`);
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        setError(body?.error ?? errorMessage);
        return;
      }
      const parsed = parseResponse(await response.json());
      setActive(parsed.active);
      setCount(parsed.count);
      router.refresh();
    } catch {
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  return { active, count, busy, error, toggle };
}
