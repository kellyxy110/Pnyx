import { cleanupAccess } from "@/lib/media-cleanup-access";
import { cleanupWorkerStatus } from "@/lib/media-cleanup-worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const access = cleanupAccess(request);
  if (access.status !== 200) return Response.json({ error: "Unavailable." }, { status: access.status, headers });
  try {
    const status = await cleanupWorkerStatus(access.target);
    return Response.json(status, { status: status.state === "ok" ? 200 : 503, headers });
  } catch { return Response.json({ error: "Cleanup status unavailable." }, { status: 503, headers }); }
}
