# Durable upload reservations — 24 November 2026

Branch: audit/pnyx-remediation-20261025. Milestone 6A remains OPEN; 6B/6C remain PAUSED. No merge, deployment or production migration is part of this batch.

## Correction

A profile upload now commits an account-owned key and exact storage target before contacting R2. Reservation creation locks the account and fails before upload if the account, database, target or key is unavailable. Unique keys cannot renew existing receipts. PUT requests verify the reserved target, have a 30-second abort signal and release their SDK client.

Reservations have a 15-minute lease. Pointer adoption locks the account and reservation, checks ownership, media kind, target and live lease, and consumes the reservation in the same transaction as saving the new pointer and recording the previous object's cleanup. Missing, expired or already processed reservations cannot be adopted. An adoption failure rolls the consumption back. Account deletion preserves in-flight reservations and prevents a later upload from recreating a profile.

Interrupted or failed uploads retain their exact-key provenance. The worker never deletes within the live lease. After expiry it removes the unreferenced object but retains the reservation as an UPLOAD_ABANDONED tombstone, scheduled for another sweep after 24 hours. Failed provider calls retain the reservation and existing backoff. This deliberately covers delayed writes after an earlier delete instead of treating an initial 404 as permanent completion. Ordinary pointer-cleanup receipts retain their existing completion behavior. No bucket-wide scan or deletion is introduced.

## Recovery contract and limits

The existing guarded isolated recovery command must be run again when receipts are due. It returns nonzero while any receipt/tombstone remains, including after an abandoned object's successful sweep. False from processMediaCleanup means the receipt was not retired; it does not necessarily mean the provider delete failed. A maintained scheduler and alerting are still required before production acceptance. No production worker or schedule is enabled here.

Abandoned reservation tombstones are retained indefinitely by application recovery. Their operational retention/reconciliation policy remains open. The deterministic tests simulate interruption by omitting pointer adoption and simulate a delayed write by writing the same exact synthetic key again; this is not a process-kill or provider-network fault experiment. Verification databases remain disposable; tests explicitly remove only their own synthetic keys and receipts in fixture teardown. Production must retain its recovery database and backups. Existing objects uploaded before this correction need separate inventory reconciliation. Production custom-domain/historical cache withdrawal, Windows checkout preservation and final release identity remain open.

## Validation

Verified source commit: `85199763d123655f8a522fa822f78b0447940dc0`.

- [Native CI 45432893019](https://github.com/kellyxy110/Pnyx/actions/runs/45432893019) passed first attempt: TypeScript, zero-warning lint, 146 unit tests across 24 files, build, 40 HTTP/database scenarios, 90 browser checks and 12 intentional R2 skips. Full and production dependency audits each reported zero vulnerabilities.
- [Provider CI 45432893170](https://github.com/kellyxy110/Pnyx/actions/runs/45432893170) passed first attempt: 40 HTTP/database scenarios and all 102 browser cases, including 12 real R2 cases. The abandoned-upload/repeated-write case passed on mobile, tablet and desktop; the existing image lifecycle and account-deletion cases also passed.
- Both runs replayed all 14 migrations without schema drift. The additive migration was applied only in disposable CI.
- The provider runner's final recovery command reported attempted=0, completed=0, pending=0 after explicit synthetic fixture teardown. This does not imply that production recovery should retire abandoned tombstones.
- Local security configuration checks passed 5/5, and runtime security headers passed against the local built application at loopback. Local TypeScript, lint, 146 unit tests and build also passed during implementation.

The provider request is disabled in the evidence commit. No merge, deployment or production database operation occurred. [Machine-readable results](upload-reservations-2026-11-24-results.json).
