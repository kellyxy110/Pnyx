# Pnyx public launch roadmap

Updated: 2026-11-24
Production: https://pnyx-psi.vercel.app  
Repository: https://github.com/kellyxy110/Pnyx

## Current status

Pnyx remains in Milestone 6A — Core Product Completion. Milestones 0–5 contain implemented foundations; that does not certify every proposed integration or production workflow. GitHub main remains `f7305ab`; later remediation fixes are on `audit/pnyx-remediation-20261025`, recorded at `6cbf5ef` before the current documentation update. The November 3 candidate `fa7a291` passed 88 unit tests, 27 native HTTP scenarios, 90 local browser checks (three R2 skips), 77 responsive combinations, TypeScript/lint/build and security-header checks. All 12 migrations replayed without drift. These are historical scoped results, not a fresh November 24 run.

Production media reports disabled on November 24. The supplied older Vercel READY handoff cannot establish the current production commit: deployment lookup currently returns 404 through this connection. The November 3 production deployment attempt was refused with 403. No later remediation release is verified. See the [current source/handoff reconciliation](pnyx-roadmap-reconciliation-2026-11-24.md) and [November 3 evidence](end-to-end-profile-review-2026-11-03.md).

6A still requires isolated provider-backed media evidence, hardened positive test-target guards, current release identity and production-adjacent browser acceptance. 6B/6C remain paused. PIRP workstream labels map to this roadmap; public integration API implementation and advanced engines remain later work.

## Delivery roadmap

### Phase 0 — Foundation — COMPLETE

Next.js, TypeScript, Prisma/PostgreSQL, migrations, validation, logging, health checks, analytics, design tokens, authentication foundation, and deployment configuration.

### Phase 1 — Identity and Spaces — COMPLETE

Credentials authentication, OAuth wiring, profiles, account recovery/deletion, Spaces, memberships, following, permissions, and seed data.

### Phase 2 — Discussion loop — COMPLETE

Posts, Markdown/code, replies, mentions, reactions, bookmarks, edits, deletion, questions, accepted answers, reports, blocks, mutes, notifications, and abuse limits.

### Phase 3 — Knowledge layer — COMPLETE

Artifacts, contributors, sources, revisions, citations, statuses, related discussions, corrections, provenance, and measurement.

### Phase 4 — AI assistance — COMPLETE IN CODE

Provider abstraction, summaries, tags, related discussions, source suggestions, drafting assistance, provenance, feedback, controls, and graceful fallback. Production AI quality and cost review remain operational checks.

### Phase 5 — Search and discovery — COMPLETE IN CODE

Keyword search, filters, explanations, permission-aware exclusions, ranking evaluation, and relevance-monitoring foundations. Semantic retrieval remains gated by baseline metrics.

### Phase 6A — Core Product Completion — IN PROGRESS

1. Authenticated application state — COMPLETE.
2. Shared responsive three-column application shell — COMPLETE; latest local responsive audit 77/77.
3. Isolated authenticated browser journeys and targeted native PostgreSQL verification — COMPLETE for their recorded scope. R2 media and production-adjacent browser acceptance — OPEN.
4. Positive app/database/storage test-target guard hardening and Windows source preservation/reconciliation — OPEN.
5. Verified deployment identity and release of the later remediation candidate — OPEN; historical deployment READY does not satisfy this item.

### Phase 6B/6C — PAUSED

1. Automated WCAG/static/axe checks — COMPLETE.
2. Keyboard focus and reduced-motion regression checks — COMPLETE.
3. Responsive public-route matrix: 77/77 locally — COMPLETE; manual real-device evidence remains open.
4. Failure-recovery, load, security, deletion-propagation, and backup/restore evidence — OPEN.
5. Manual Lighthouse, screen-reader, real-device QA — OPEN.
6. Resend developer-recipient acceptance test — EXTERNAL/HUMAN.
7. Google/GitHub live browser verification — EXTERNAL/HUMAN.
8. Closed-beta recruitment, consent, feedback, and cohort review — HUMAN.

### Phase 7 — Public launch preparation — NOT STARTED

Release candidate review, incident exercise, backup restore exercise, security sign-off, performance budgets, legal/privacy review, support process, public launch decision, and rollback rehearsal.

## Remaining automatable backlog

- Add deterministic failure-recovery tests for database, email, Redis/cache, timeout, retry, malformed input, and duplicate requests.
- Expand authorization/IDOR/CSRF/XSS/rate-limit and abuse-protection regression tests.
- Verify deletion propagation across users, posts, replies, notifications, search results, artifacts, AI outputs, caches, and uploaded assets.
- Validate backup and restore procedures against an isolated database.
- Run safe authenticated load tests against local or preview infrastructure.
- Add Lighthouse CI and route performance budgets when a supported browser runner/CI environment is available.
- Re-run dependency/security scans for the final release candidate. November 3 production audit was clean, but the complete audit retained 13 moderate development-tool findings; do not claim a current zero-advisory baseline.

## Human or external backlog

- Manual screen-reader and real-device testing.
- Manual Lighthouse review and visual regression review.
- Live GitHub OAuth browser verification.
- Resend acceptance using only the Resend-account email with `onboarding@resend.dev`.
- Custom verified email domain for arbitrary recipients.
- Closed-beta recruitment, consent, legal/privacy review, interviews, and retention evidence.
- Provider-level production backup/restore approval and incident exercise.

## Future product modules — architecture only until Milestone 6 closes

1. Organisation verification and organisation pages.
2. Learning collections, roadmaps, and courses.
3. Events, workshops, hackathons, and live discussions.
4. Collaboration requests and project matching.
5. Jobs, freelance work, internships, and recruiting.
6. Marketplace.
7. Public API and developer SDK.
8. GitHub, StackBlitz, Figma, YouTube, and other embeds/integrations.
9. Multilingual translation and advanced accessibility assistance.
10. AI knowledge extraction and knowledge-graph expansion.
11. Research papers and expert verification.
12. Community reputation and AI-assisted moderation.
13. Native mobile applications and enterprise communities.

Each future module requires its own ADR, Prisma schema/migration plan, authorization model, API contract, component hierarchy, abuse model, analytics events, accessibility plan, tests, and rollout evidence before implementation.

## Evidence index

- [Milestone checklist](../tasks.md)
- [Definition of Done](../definition-of-done.md)
- [Accessibility report](accessibility-report.md)
- [Performance and responsive report](performance-report.md)
- [Security report](security-report.md)
- [Failure recovery](failure-recovery.md)
- [Backup and restore](backup-restore.md)
- [Deletion propagation](deletion-propagation.md)
- [Manual QA checklist](manual-qa-checklist.md)
- [Beta readiness report](beta-readiness-report.md)
