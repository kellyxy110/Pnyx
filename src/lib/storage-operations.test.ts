import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ send: vi.fn(), destroy: vi.fn(), construct: vi.fn() }));
vi.mock("@aws-sdk/client-s3", () => ({
 S3Client: class { constructor() { mocks.construct(); } send = mocks.send; destroy = mocks.destroy; },
 PutObjectCommand: class { constructor(public input: unknown) {} },
 DeleteObjectCommand: class { constructor(public input: unknown) {} },
}));
import { deleteObject, putImage } from "./storage";
const image = { key: "users/fixture/avatar/object.webp", body: Buffer.from("synthetic-raster-fixture"), contentType: "image/webp", bytes: 24, width: 256, height: 256 };
beforeEach(() => {
 vi.resetAllMocks(); mocks.send.mockResolvedValue({});
 vi.stubEnv("R2_ENDPOINT", "https://fixture.r2.cloudflarestorage.com"); vi.stubEnv("R2_ACCESS_KEY_ID", "fixture-access"); vi.stubEnv("R2_SECRET_ACCESS_KEY", "fixture-secret"); vi.stubEnv("R2_BUCKET_NAME", "pnyx-e2e-fixture"); vi.stubEnv("R2_PUBLIC_BASE_URL", "https://media.example.test/");
});
afterEach(() => vi.unstubAllEnvs());
describe("profile image object-store boundary", () => {
 it("requests no-store for new objects and returns the managed receipt", async () => {
  expect(await putImage(image)).toEqual({ key: image.key, url: `https://media.example.test/${image.key}`, contentType: image.contentType, bytes: image.bytes, width: image.width, height: image.height });
  expect(mocks.send).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ input: { Bucket: "pnyx-e2e-fixture", Key: image.key, Body: image.body, ContentType: "image/webp", CacheControl: "no-store" } }));
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
 });
 it("propagates upload failures and releases the client", async () => {
  mocks.send.mockRejectedValue(new Error("Fixture provider unavailable")); await expect(putImage(image)).rejects.toThrow("Fixture provider unavailable"); expect(mocks.destroy).toHaveBeenCalledTimes(1);
 });
 it("deletes only the requested key and releases the client", async () => {
  await deleteObject(image.key); expect(mocks.send).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ input: { Bucket: "pnyx-e2e-fixture", Key: image.key } }), expect.objectContaining({ abortSignal: expect.any(AbortSignal) })); expect(mocks.destroy).toHaveBeenCalledTimes(1);
 });
 it("propagates deletion failures and releases the client", async () => {
  mocks.send.mockRejectedValue(new Error("Fixture deletion unavailable")); await expect(deleteObject(image.key)).rejects.toThrow("Fixture deletion unavailable"); expect(mocks.destroy).toHaveBeenCalledTimes(1);
 });
 it("does not construct a deletion request without a key", async () => {
  await deleteObject(null); await deleteObject(undefined); expect(mocks.construct).not.toHaveBeenCalled(); expect(mocks.send).not.toHaveBeenCalled();
 });
 it("refuses upload before creating a client when configuration is incomplete", async () => {
  vi.stubEnv("R2_BUCKET_NAME", ""); await expect(putImage(image)).rejects.toThrow("STORAGE_NOT_CONFIGURED"); expect(mocks.construct).not.toHaveBeenCalled();
 });
});

it("never treats missing deletion configuration as successful cleanup", async () => { vi.stubEnv("R2_BUCKET_NAME", ""); await expect(deleteObject(image.key)).rejects.toThrow("STORAGE_NOT_CONFIGURED"); expect(mocks.send).not.toHaveBeenCalled(); });
it("refuses a persisted cleanup target that differs from current configuration", async () => { await expect(deleteObject(image.key, {endpoint:"https://fixture.r2.cloudflarestorage.com",bucket:"pnyx-e2e-other"})).rejects.toThrow("STORAGE_TARGET_MISMATCH"); expect(mocks.send).not.toHaveBeenCalled(); });
