import { createHash, timingSafeEqual } from "node:crypto";
import { storageTarget } from "./storage";

export function cleanupAccess(request: Request) {
  if (process.env.MEDIA_CLEANUP_ENABLED !== "true") return { status: 404 } as const;
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return { status: 503 } as const;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(hash(request.headers.get("authorization") ?? ""), hash(`Bearer ${secret}`))) return { status: 401 } as const;
  const target = storageTarget();
  if (!target || target.endpoint !== process.env.MEDIA_CLEANUP_ENDPOINT || target.bucket !== process.env.MEDIA_CLEANUP_BUCKET) return { status: 503 } as const;
  return { status: 200, target } as const;
}
