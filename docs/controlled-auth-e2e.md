# Controlled authenticated Playwright journeys

Authenticated browser tests use a dedicated non-production Pnyx environment and a dedicated test account. They never run against `https://pnyx-psi.vercel.app` and they never use a personal OAuth account.

## Required environment variables

- `PLAYWRIGHT_BASE_URL`: local or Preview Pnyx URL. The canonical production URL is rejected.
- `E2E_EMAIL`: verified credentials-test-account email.
- `E2E_PASSWORD`: credentials-test-account password.
- `E2E_ALLOW_AUTHENTICATED=true`: explicit opt-in for the authenticated suite.

Run `npx playwright test tests/e2e/authenticated-journeys.spec.ts` only after the target has isolated data and the test account has been provisioned. Without all four values, the suite is skipped with an explicit reason.

Current coverage is intentionally non-mutating: sign-in, persisted profile loading, session menu, and composer availability. Multi-user create/reply/follow/join flows require an isolated database with deterministic fixtures and cleanup; they must not run against production user data.