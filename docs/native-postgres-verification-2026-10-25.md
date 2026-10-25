# Native PostgreSQL verification, 25 October 2026

Branch: `audit/pnyx-remediation-20261025`

## Scope

This verification follows the Phase 1–10 reconciliation at `0c64c3d`. The earlier 64 unit tests, 51 browser checks, and 77 responsive combinations used an isolated PGlite fixture for persistence. They did not establish native PostgreSQL concurrency or migration replay.

The new suite uses the real Auth.js credentials callback, real signed session cookies, HTTP requests to the production-mode Next.js application, and direct Prisma reads against the same disposable database. No auth or database module is mocked.

## Test cases

1. Anonymous Join/Leave returns 401 without mutation.
2. Twenty concurrent Join requests create one membership with authoritative counts.
3. Twenty concurrent Leave requests remain idempotent.
4. Twenty moderator Leave requests preserve moderator membership and return `joined: true`.
5. Two independent sessions racing to Join share one membership.
6. Join/Leave/rejoin persists across fresh API reads.
7. Deleting an account revokes its existing cookie for profile reads and protected writes.
8. Suspension revokes an existing session; expiration restores identity.
9. Missing/private Spaces cannot acquire membership through Join.

The runner first replays the repository's migrations into the disposable database, checks migration status and schema drift, generates Prisma Client, and builds the application. Tests use Playwright's API request client; these are native-database HTTP integration checks, not additional browser UI checks.

## Safety

- The target guard requires `PNYX_DISPOSABLE_POSTGRES=1`, a loopback PostgreSQL host, and a database name beginning `pnyx_verify_`.
- Database URL overrides that could redirect a connection, change schema, or enable pooler compatibility are rejected. Tests use the native connection behavior.
- The application target must be a loopback HTTP origin.
- Only synthetic users and Spaces created by this run are removed during test cleanup.
- External email, OAuth, AI, and object-storage credentials are disabled for the local application process. Session secrets and test passwords are generated per run and are not committed.
- GitHub Actions uses a disposable `postgres:16` service. The workflow is restricted to the remediation branch, has read-only repository permissions, uses pinned checkout/setup-node actions, and has no deployment steps.
- Vercel automatic deployment remains disabled for the remediation branch.

## Execution status

The workspace maps only uid/gid 0 and does not permit creating a non-root identity for native PostgreSQL. The test database will run in GitHub Actions instead. Native results remain pending until the workflow completes successfully; this document does not declare the native gate complete.

## Local reproduction

Provision a fresh local PostgreSQL database named `pnyx_verify_local`, then supply its URL through `DATABASE_URL` without printing or committing credentials. Set `PNYX_DISPOSABLE_POSTGRES=1` and `APP_URL=http://127.0.0.1:3000`. After `npm ci`, run `npm run verify:postgres`. The runner applies migrations only after the target guard passes. Do not point it at production or an existing project database.

R2 verification, real-device/screen-reader review, the wider resilience/security backlog, and closed-beta evidence remain open. Milestone 6A is not closed by adding this suite.
