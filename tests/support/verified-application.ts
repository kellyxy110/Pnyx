import { randomBytes } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import { proofMatches, verificationProof } from "../../src/lib/disposable-verification";

/** Run before fixture writes or credential entry. Never follow redirects to a different target. */
export async function assertVerifiedApplication(client: APIRequestContext, env: Record<string, string | undefined> = process.env) {
  const nonce = randomBytes(32).toString("hex");
  const expected = verificationProof(env, nonce);
  const response = await client.get("/api/health", { headers: { "X-Pnyx-Verification-Nonce": nonce }, maxRedirects: 0 });
  if (response.status() !== 200 || !proofMatches(expected, response.headers()["x-pnyx-verification-proof"])) throw new Error("Running application did not prove the disposable verification target. No fixture writes are permitted.");
}
