import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isStorageConfigured, publicUrlForKey } from "./storage";

const storageKeys = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_BASE_URL"] as const;
const originalValues = Object.fromEntries(storageKeys.map((key) => [key, process.env[key]]));

describe("media storage configuration", () => {
  beforeEach(() => {
    for (const key of storageKeys) delete process.env[key];
  });

  afterEach(() => {
    for (const key of storageKeys) {
      if (originalValues[key] === undefined) delete process.env[key];
      else process.env[key] = originalValues[key];
    }
  });

  it("stays disabled until every provider setting exists", () => {
    process.env.R2_ENDPOINT = "https://account.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "test-access";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";
    process.env.R2_BUCKET_NAME = "pnyx-media";
    expect(isStorageConfigured()).toBe(false);
  });

  it("reports a complete provider configuration without exposing values", () => {
    process.env.R2_ENDPOINT = "https://account.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "test-access";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";
    process.env.R2_BUCKET_NAME = "pnyx-media";
    process.env.R2_PUBLIC_BASE_URL = "https://media.example.com/";
    expect(isStorageConfigured()).toBe(true);
  });

  it("derives a public URL from a key and strips a trailing slash", () => {
    process.env.R2_ENDPOINT = "https://account.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "test-access";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret";
    process.env.R2_BUCKET_NAME = "pnyx-media";
    process.env.R2_PUBLIC_BASE_URL = "https://media.example.com/";
    expect(publicUrlForKey("users/user_1/avatar/image.webp")).toBe("https://media.example.com/users/user_1/avatar/image.webp");
    expect(publicUrlForKey(null)).toBeNull();
  });
});
