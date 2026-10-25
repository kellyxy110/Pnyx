# Pnyx roadmap and remaining work

## Evidence update, 25 October 2026

Phase 1–10 remediation is committed at `0c64c3d` on `audit/pnyx-remediation-20261025`. Verified local evidence: TypeScript/lint/build pass, 64 unit tests, 51 browser checks, 77 responsive combinations, and zero known dependency advisories. Three R2 tests remain skipped. These results supersede the older public-route counts below without claiming production acceptance.

[Native PostgreSQL verification](native-postgres-verification-2026-10-25.md) now passes: all 12 migrations replayed without schema drift, nine HTTP integration scenarios passed, and CI passed 70 unit tests plus TypeScript/lint/build. It exposed and verified a fix for a real two-session Join race that previously returned HTTP 500. The next gate is isolated R2 avatar/banner verification, followed by the remaining Milestone 6A acceptance evidence. Milestones 6B/6C remain gated.

## Completed milestones

0. Foundation — Next.js, TypeScript, Prisma/PostgreSQL integration, validation, logging, health checks, analytics, and design system.
1. Identity and Spaces — registration, email/password authentication, recovery, profiles, permissions, Spaces, following, moderation ownership, and seed data.
2. Discussion loop — posts, Markdown/code, replies, mentions, reactions, saves, editing, deletion, questions, accepted answers, reports, blocks, mutes, notifications, and abuse limits.
3. Knowledge layer — artifacts, contributors, sources, revisions, statuses, citations, related discussions, corrections, and measurement.
4. AI assistance — provider abstraction, summaries, tags, related discussions, source suggestions, drafting assistance, provenance, feedback, controls, and quality safeguards.
5. Search and discovery — indexed search, filters, explanations, permission-aware exclusion, ranking evaluation, and relevance monitoring.

## Milestone 6 — Beta readiness (open)

1. Complete WCAG 2.2 AA keyboard, focus, and screen-reader audit.
2. Complete responsive audit on public mobile, tablet, desktop, and wide-desktop routes. (Complete locally: 77/77 route/viewport combinations; real-device review remains open.)
3. Add and execute load, failure recovery, backup/restore, deletion-propagation, and security tests.
4. Recruit learners, engineers, researchers, maintainers, and moderators for closed beta.
5. Review beta evidence and decide whether to expand, narrow, or revise scope.
6. Run manual Lighthouse and screen-reader release QA.
7. Configure Google/GitHub OAuth only when credentials exist; unavailable providers must remain safely disabled.
8. Test Resend using `Pnyx <onboarding@resend.dev>` only with the email linked to the Resend account.

## Later modules (gated by Milestone 6)

- Organisation verification and organisation pages.
- Learning collections, roadmaps, and courses.
- Events, workshops, hackathons, and live discussions.
- Collaboration requests and project matching.
- Jobs, freelance work, internships, and recruiting.
- Public API and GitHub/StackBlitz/Figma/YouTube integrations.
- Multilingual translation and advanced accessibility assistance.
- Native mobile, enterprise communities, and marketplace capabilities.

The authoritative checkbox list remains `tasks.md`; completion is governed by `definition-of-done.md`.
