# Durable profile media cleanup — 24 November 2026

Branch: audit/pnyx-remediation-20261025. Milestone 6A remains OPEN; no production migration, merge or deployment is authorized by this batch.

## Confirmed gap and correction

Previously, profile pointer changes and account deletion discarded the old object keys before provider cleanup, while failed deletion was only logged. Missing storage configuration could also be treated as successful object deletion.

A MediaCleanup outbox now records the exact key, endpoint and bucket in the same transaction as a pointer swap or account deletion. It has no user foreign key, so receipts survive deleted accounts. Keys must belong to the affected user's managed avatar/banner prefix. Missing configuration with current media aborts the account/pointer transaction. Existing receipts from previous replacements are included in account-deletion cleanup status.

Immediate cleanup is attempted after commit. Provider or configuration failure retains the receipt with bounded exponential backoff and a sanitized failure code. Worker transactions use FOR UPDATE SKIP LOCKED, reject mismatched storage targets and refuse any object still referenced by a profile. Provider requests are aborted after three seconds; the worker transaction has a ten-second limit. A successful deletion removes its receipt. Repeated object-store deletion is idempotent if the provider succeeded but the database acknowledgement failed.

API responses expose cleanupPending rather than claiming all images are gone. Profile feedback distinguishes a cleared pointer from pending file cleanup. Account deletion still signs out the deleted account and reports pending image cleanup when necessary.

## Isolated verification and recovery command

npm run media:cleanup is deliberately restricted to an opted-in disposable loopback PostgreSQL database and matching dedicated pnyx-e2e R2 declarations. It processes at most 25 due receipts, prints counts only and exits nonzero if any receipts remain. No production cron, hosted worker or new public administrative endpoint is activated. An operator must run the command again after backoff for isolated recovery; a production worker/schedule and operational alerting still need separate acceptance.

The native database suite adds provider-failure/backoff/retry, preservation when configuration is absent, referenced-object and target-mismatch refusal, transaction rollback, concurrent-worker exclusion and prior-receipt survival scenarios. Its storage delete function is replaced only at the provider boundary for deterministic failure tests. The real-provider suite adds deletion of a new synthetic account with both images, verifies session revocation, database deletion, origin absence, development delivery URL absence and empty account-scoped receipts on all three devices. It does not use a live user account.

Local TypeScript, zero-warning lint, 143 unit tests and build passed during implementation. The complete candidate is submitted to native PostgreSQL and real-provider CI; final results will be appended after completion. The new thirteenth migration is only replayed in disposable CI, never production.

## Remaining limits

This outbox covers objects whose old pointer is captured transactionally. A crash or simultaneous database/provider failure after a new upload but before its pointer is persisted still needs durable pre-upload reservations or inventory reconciliation; the existing best-effort orphan cleanup does not close that gap. No bucket-wide deletion, secret disclosure, production cache purge or production account deletion was performed. Development r2.dev withdrawal is not production custom-domain cache certification. Windows checkout recovery, final release identity and production-adjacent acceptance remain open. The previously documented intermittent knowledge-editor test remains tracked.
