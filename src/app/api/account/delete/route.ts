import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { attemptMediaCleanup } from "@/lib/media-cleanup";
import { deleteAccountWithMedia } from "@/lib/delete-account";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { confirmation?: string } | null;
  if (body?.confirmation !== "DELETE MY ACCOUNT") return NextResponse.json({ error: "Type DELETE MY ACCOUNT to confirm." }, { status: 400 });
  let cleanupIds: string[];
  try {
    cleanupIds = await deleteAccountWithMedia(session.user.id);
  } catch { return NextResponse.json({ error: "Your account could not be safely deleted. Please try again." }, { status: 503 }); }
  const cleaned = await attemptMediaCleanup(cleanupIds);
  await signOut({ redirect: false });
  return NextResponse.json({ message: cleaned ? "Your account has been deleted." : "Your account has been deleted. Image cleanup is pending.", cleanupPending: !cleaned });
}
