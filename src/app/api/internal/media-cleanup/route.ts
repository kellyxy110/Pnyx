import { cleanupAccess } from "@/lib/media-cleanup-access";
import { runMediaCleanupBatch } from "@/lib/media-cleanup-worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  const access = cleanupAccess(request);
  if (access.status !== 200) return Response.json({ error: "Unavailable." }, { status: access.status, headers });
  try {
    const report = await runMediaCleanupBatch(access.target);
    return Response.json(report, { status: report.state === "busy" ? 409 : report.state === "attention" ? 503 : 200, headers });
  } catch { return Response.json({ error: "Cleanup unavailable." }, { status: 503, headers }); }
}
export const POST = GET;
