# Beta security and recovery test plan

## Automated checks completed

- Prisma schema validation and migration status: database up to date.
- Tracked-source secret scan: no secret-like matches in non-documentation source files.
- Authentication gates verified on moderation and appeal APIs.
- Report and appeal rate limits persist `RATE_LIMIT_BLOCKED` audit events.
- Health endpoint verifies PostgreSQL connectivity without returning database details.
- Account deletion uses cascading Prisma relations for dependent identity/content records.
- Production build, lint, typecheck, and unit tests pass.

## Operational checks required in staging

1. Create a disposable backup and restore it into an isolated database; verify migration replay and row counts.
2. Exercise deletion propagation for a user, post, reply, artifact, source, report, appeal, notification, and audit relation.
3. Run authenticated load tests for feed, search, reports, and moderation queue with rate limits enabled.
4. Validate rollback compatibility by deploying an application-only rollback without removing migrations.
5. Run dependency audit remediation on a branch and upgrade the framework only after a compatibility build and smoke test.

## Current dependency finding

`npm audit --omit=dev --audit-level=high` reports four vulnerabilities in the framework dependency chain involving nested `postcss` and `sharp`. The suggested `npm audit fix --force` would install a breaking Next.js downgrade, so it was not applied automatically. Remediation requires a deliberate framework/dependency upgrade and compatibility verification.