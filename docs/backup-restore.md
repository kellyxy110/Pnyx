# Backup and restore procedure

## Safety

Never run restore against production. Use a disposable isolated PostgreSQL database and confirm its connection target before any restore command. Never print connection strings.

## Backup procedure

1. Confirm the target is an isolated backup database or provider-managed backup workspace.
2. Use the PostgreSQL provider's encrypted logical backup or snapshot facility.
3. Record timestamp, schema migration version, row-count summary, retention, and operator.
4. Store the encrypted backup outside the repository with restricted access.

## Restore verification

1. Provision a fresh isolated PostgreSQL database.
2. Restore the encrypted backup into that database.
3. Run Prisma schema validation and migration status checks.
4. Verify representative row counts and relations without exporting private content.
5. Run health, authentication, feed, search, knowledge, and moderation smoke tests.
6. Dispose of the isolated database according to the provider's retention policy.

## Current status

The repository defines Prisma migrations and a health check, but an isolated restore exercise requires provider access and must be performed by an authorized operator. No production backup or restore was attempted.

