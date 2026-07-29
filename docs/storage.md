# Media storage

Pnyx uses a provider-neutral media layer in `src/lib/storage.ts`. Cloudflare R2 is the initial S3-compatible provider.

## Required environment variables

Configure these in Vercel Production and Preview without committing values:

- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

`R2_PUBLIC_BASE_URL` must be the HTTPS public/custom-domain base that serves the bucket. It is used only to derive public media URLs from stored object keys.

## Profile media behavior

- Avatar: JPG, PNG, or WebP; maximum 5 MB; at least 128 × 128.
- Banner: JPG, PNG, or WebP; maximum 10 MB; at least 600 × 160.
- Images are normalized to WebP, resized server-side, and stored under a user-scoped object key.
- Replacing or removing media deletes the previous object on a best-effort basis; failures are logged without exposing credentials.
- The upload API returns a friendly error when storage is not configured. The profile UI hides upload controls until configuration is detected.

## Operational verification

Before enabling uploads for users, configure a dedicated R2 bucket and public delivery domain, then verify upload, replacement, deletion, cache behavior, and account-deletion cleanup in Production with a controlled test account. Do not use database binaries for media.