import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/health";

import { localVerificationProof } from "@/lib/disposable-verification";

export async function GET(request: Request) {
  const result = await checkHealth();
  const proof = result.status === "ok" ? localVerificationProof(process.env, request.headers.get("x-pnyx-verification-nonce")) : null;
  return NextResponse.json(result, { status: result.status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store", ...(proof ? { "X-Pnyx-Verification-Proof": proof } : {}) } });
}
