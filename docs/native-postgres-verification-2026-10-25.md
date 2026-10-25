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
5. Two independent sessions racing to Join share one membership, repeated over five rounds of 20 requests.
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

The targeted native PostgreSQL gate passed in [GitHub Actions run 40184865054](https://github.com/kellyxy110/Pnyx/actions/runs/40184865054), testing commit `1abfd2bb7d6e6ef0fe599229e244a505a1cb960e`. The workspace maps only uid/gid 0, so the native database ran in a disposable GitHub-hosted service rather than this workspace. Service logs identify native PostgreSQL 16.15 on Linux x86_64.

| Check | Result |
| --- | --- |
| Clean npm installation | PASS; zero known dependency vulnerabilities reported |
| TypeScript and ESLint | PASS; lint uses zero-warning acceptance |
| Vitest | PASS; 17 files, 70 tests |
| Migration replay | PASS; all 12 migrations applied to a fresh disposable database |
| Migration status | PASS; database up to date |
| Schema drift | PASS; no difference between replayed database and `schema.foundation.prisma` |
| Prisma generation and Next.js production-mode build | PASS |
| Native HTTP integration scenarios | PASS; nine passed, zero failed, zero skipped |

These results are also summarized in `native-postgres-verification-2026-10-25.json`. The preceding 51 browser checks and 77 responsive combinations remain historical UI evidence from the Phase 1–10 reconciliation; they were not rerun as part of this native HTTP suite.

## Defect found and corrected

The first runner attempt stopped before the integration tests because top-level await was incompatible with the project's CommonJS execution mode. The runner now uses an async entrypoint through `node --import tsx`; its fail-closed startup was executed locally.

The next run replayed all migrations and passed eight of nine native scenarios. The two-session Join race returned HTTP 500 with Prisma `P2002` duplicate-key errors. An empty-update `spaceMember.upsert` did not guarantee an atomic conflict-tolerant insert under native concurrency, despite the old source comment and passing mocked tests.

The membership POST now uses `createMany` with `skipDuplicates: true`, leaving existing membership and moderator status intact. Counts still come from the database. No schema change or migration was needed. The strengthened five-round two-session race passed in the final native run. The failing run is [40184651889](https://github.com/kellyxy110/Pnyx/actions/runs/40184651889); the initial runner failure is [40184484501](https://github.com/kellyxy110/Pnyx/actions/runs/40184484501).

## Remaining boundaries

This is targeted native-database evidence, not load testing or proof of every concurrency interleaving. Backup/restore, full deletion propagation, failure recovery, wider abuse/security checks, OAuth/email providers, real-device/browser acceptance, and R2 remain separate gates. No production database, production migration, merge, or deployment was involved. The CI service was stopped and removed after the job.

## Local reproduction

Provision a fresh local PostgreSQL database named `pnyx_verify_local`, then supply its URL through `DATABASE_URL` without printing or committing credentials. Set `PNYX_DISPOSABLE_POSTGRES=1` and `APP_URL=http://127.0.0.1:3000`. After `npm ci`, run `npm run verify:postgres`. The runner applies migrations only after the target guard passes. Do not point it at production or an existing project database.

R2 verification, real-device/screen-reader review, the wider resilience/security backlog, and closed-beta evidence remain open. Milestone 6A is not closed by adding this suite.
