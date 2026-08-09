# Controlled authenticated Playwright journeys

Authenticated browser tests use a dedicated non-production Pnyx environment and a dedicated test account. They never run against `https://pnyx-psi.vercel.app` and they never use a personal OAuth account.

## Required environment variables

- `PLAYWRIGHT_BASE_URL`: local or Preview Pnyx URL. The canonical production URL is rejected.
- `E2E_EMAIL`: verified credentials-test-account email.
- `E2E_PASSWORD`: credentials-test-account password.
- `E2E_ALLOW_AUTHENTICATED=true`: explicit opt-in for the authenticated suite.

Run `npx playwright test tests/e2e/authenticated-journeys.spec.ts` only after the target has isolated data and the test account has been provisioned. Without all four values, the suite is skipped with an explicit reason.

The suite covers sign-in, persisted profile loading, session-menu state, scoped composer context, profile persistence, Space membership rollback, and optional avatar upload/removal. Mutating tests require an isolated database with deterministic fixtures and cleanup; they must not run against production user data.

Set `E2E_STORAGE_ENABLED=true` only when the isolated target has a dedicated R2 bucket and the test account's uploaded objects can be cleaned up. The upload journey uses `public/images/pnyx-community-collage.png` as a controlled fixture.

The full multi-user discussion, reply, follow, notification, and search journeys remain a separate fixture-backed expansion. They require two isolated test accounts and cleanup hooks; no production account is used as a substitute.
