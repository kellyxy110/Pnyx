# Pnyx public launch roadmap

Updated: 2026-10-25
Production: https://pnyx-psi.vercel.app  
Repository: https://github.com/kellyxy110/Pnyx

## Current status

Pnyx is in Milestone 6A — Core Product Completion. Milestones 0–5 are implemented. The remediation branch now has verified native PostgreSQL migration replay and nine critical HTTP/session/concurrency scenarios, alongside TypeScript/lint/build and 70 passing unit tests. This work has not been merged or deployed. R2 media verification and production-adjacent browser acceptance remain open within 6A; resilience/security, backup/restore, deletion propagation, manual release QA, and closed-beta evidence remain later gates. See the [native verification report](native-postgres-verification-2026-10-25.md).

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
- Maintain the remediated dependency baseline; the native verification CI run reports zero known vulnerabilities.

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
