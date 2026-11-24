import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StoredImage = { key: string; url: string; contentType: string; bytes: number; width: number; height: number };
type StorageConfig = { endpoint: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicBaseUrl: string };
export type StorageTarget = { endpoint: string; bucket: string };

function getConfig(): StorageConfig | null {
  const values = [process.env.R2_ENDPOINT, process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY, process.env.R2_BUCKET_NAME, process.env.R2_PUBLIC_BASE_URL];
  return values.every(Boolean) ? { endpoint: values[0]!, accessKeyId: values[1]!, secretAccessKey: values[2]!, bucket: values[3]!, publicBaseUrl: values[4]!.replace(/\/$/, "") } : null;
}
export function isStorageConfigured() { return Boolean(getConfig()); }
export function storageTarget(): StorageTarget | null { const config = getConfig(); return config ? { endpoint: config.endpoint.replace(/\/$/, ""), bucket: config.bucket } : null; }
export function publicUrlForKey(key: string | null | undefined) { const config = getConfig(); return config && key ? `${config.publicBaseUrl}/${key}` : null; }
function client(config: StorageConfig) { return new S3Client({ region: "auto", endpoint: config.endpoint, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }); }
export async function putImage(input: { key: string; body: Buffer; contentType: string; bytes: number; width: number; height: number }, expected?: StorageTarget): Promise<StoredImage> {
  const config = getConfig();
  if (!config) throw new Error("STORAGE_NOT_CONFIGURED");
  if (expected && (config.endpoint.replace(/\/$/, "") !== expected.endpoint || config.bucket !== expected.bucket)) throw new Error("STORAGE_TARGET_MISMATCH");
  const storage = client(config);
  try { await storage.send(new PutObjectCommand({ Bucket: config.bucket, Key: input.key, Body: input.body, ContentType: input.contentType, CacheControl: "no-store" }), { abortSignal: AbortSignal.timeout(30_000) }); }
  finally { storage.destroy(); }
  return { key: input.key, url: `${config.publicBaseUrl}/${input.key}`, contentType: input.contentType, bytes: input.bytes, width: input.width, height: input.height };
}
export async function deleteObject(key: string | null | undefined, expected?: StorageTarget) {
  if (!key) return;
  const config = getConfig();
  if (!config) throw new Error("STORAGE_NOT_CONFIGURED");
  if (expected && (config.endpoint.replace(/\/$/, "") !== expected.endpoint || config.bucket !== expected.bucket)) throw new Error("STORAGE_TARGET_MISMATCH");
  const storage = client(config);
  try { await storage.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }), { abortSignal: AbortSignal.timeout(3000) }); }
  finally { storage.destroy(); }
}
