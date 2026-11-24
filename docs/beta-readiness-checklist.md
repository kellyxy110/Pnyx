# Beta-readiness checklist

Originally generated: 2026-07-29; reconciled: 2026-11-24
Production: https://pnyx-psi.vercel.app  
Milestone: 6 — Beta readiness

Current gate: 6A OPEN; 6B/6C PAUSED. See the [source/handoff reconciliation](pnyx-roadmap-reconciliation-2026-11-24.md) for release identity, disabled production media and evidence scope. Historical test results are not live provider acceptance.

## Automatable in this repository

| Area | Task | Status | Evidence |
|---|---|---|---|
| A | Static accessibility and semantic checks | HISTORICAL AUTOMATED EVIDENCE; manual acceptance open | `docs/accessibility-report.md` |
| A | Keyboard/focus regression tests | HISTORICAL PASS for recorded browser scope | `docs/accessibility-report.md` |
| B | Responsive route and overflow checks | HISTORICAL PASS: 77/77 local; physical-device acceptance open | `docs/end-to-end-profile-review-2026-11-03.md` |
| C | Production build and route compilation | HISTORICAL local/native CI pass; current deployment identity unverified | `docs/performance-report.md` |
| D | Validation, rate-limit, provider-failure unit tests | PARTIALLY COMPLETE | `docs/failure-recovery.md` |
| E | Prisma schema/migration inspection and backup procedure | PARTIALLY AUTOMATABLE | `docs/backup-restore.md` |
| F | Cascade and soft-delete schema regression review | PARTIALLY COMPLETE | `docs/deletion-propagation.md` |
| G | Dependency, secret, lint, type, and authorization scans | PARTIAL: recorded native authorization/type/lint pass; Nov 3 production audit clean, 13 moderate dev findings; fresh scan required for release | `docs/end-to-end-profile-review-2026-11-03.md` |
| H | Auth.js provider wiring and missing-credential gating | COMPLETE IN CODE; LIVE TEST BLOCKED | `docs/beta-readiness-report.md` |
| I | EMAIL_FROM wiring and safe Resend 403 handling | COMPLETE IN CODE; delivery restricted | `docs/resend-testing.md` |
| K | Documentation and release evidence | IN PROGRESS | this checklist and linked reports |

## Partially automatable

- Recorded axe/browser audits exist. Fresh execution needs a supported browser and a positively verified isolated local/preview target; manual Lighthouse remains open.
- Responsive screenshots and tap-target checks require browser/device emulation.
- Backup/restore requires an isolated PostgreSQL database and provider access.
- Authenticated load tests require test accounts and a non-production target.
- Resend acceptance requires the Resend-account email.
- Production OAuth tests require configured provider credentials.

## Human-only or externally gated

- Manual screen-reader audit.
- Real-device and manual Lighthouse review.
- Closed-beta recruitment, consent, interviews, feedback, and retention evidence.
- Legal/privacy approval of beta consent language.
- Google/GitHub OAuth credentials and live callback validation.
- Custom-domain email delivery to arbitrary users.
- Production backup/restore approval and incident exercises.

## Operating guardrails

- Never run destructive or uncontrolled tests against production.
- Never print or commit credentials, tokens, personal email addresses, or database URLs.
- Do not mark an item complete without command output, test output, or documented external evidence.
- Do not close Milestone 6 or start later modules until the strict Definition of Done is satisfied.

