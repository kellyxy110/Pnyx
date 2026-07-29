import { NextResponse } from "next/server";
import { isEmailSignupEnabled } from "@/lib/auth-feature-flags";

export async function GET() {
  return NextResponse.json({
    emailSignupEnabled: isEmailSignupEnabled(),
    betaSignupMessage: "Email registration is temporarily limited during the closed beta. Continue with Google or GitHub instead.",
  }, { headers: { "Cache-Control": "no-store" } });
}

