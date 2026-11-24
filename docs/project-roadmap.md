# Pnyx roadmap and remaining work

## 6A target-isolation implementation, 24 November 2026

The [test-isolation batch](test-isolation-2026-11-24.md) adds positive app/database guards, a nonce-bound running-process configuration proof, dedicated storage declarations, synthetic account lifecycle, and reproducible native HTTP/browser/media commands. The [runbook](isolated-verification.md) replaces hostname-only test opt-in. Real R2 cases are prepared but remain blocked without isolated provider credentials; delivery-cache withdrawal and cleanup acceptance stay open. The candidate updates Next.js to 15.5.29 and Prisma's scoped Effect dependency to 3.22.1, with a complete zero-advisory audit recorded after the update. Native PostgreSQL 16 CI passes for a05f1fe: 12 migrations without drift, 27 HTTP scenarios, 90 browser checks, 130 unit tests, TypeScript/lint/build and zero-advisory audits; six R2 cases remain skipped. Full evidence is recorded in the batch report. 6A remains open; no release or integration activation is implied.

## Public integration contract design, 24 November 2026

A [read-only public discovery contract v1](pnyx-public-integration-v1.md), [OpenAPI design](pnyx-public-integration-v1.openapi.json), [synthetic examples](pnyx-public-integration-v1.examples.json) and [future acceptance matrix](pnyx-public-integration-v1-acceptance.md) now define the proposed boundary. Status: DRAFT, NOT IMPLEMENTED. Initial scope is public Space/discussion/published-knowledge cards and bounded keyword search, with canonical Pnyx links, explicit field allowlists and short-lived display leases. No application route, consumer integration, provider or deployment was enabled.

Before implementation, resolve source-lineage withdrawal after ON DELETE SET NULL, certify clock/expiry handling and approve measured quota budgets. Account linking, shared authentication, cross-product writes, webhooks, advanced intelligence and monetization remain gated. Milestone 6A remains open, 6B/6C paused, and public API implementation remains after the existing Milestone 6 gate. Document/schema validation is not live integration certification.

## Roadmap reconciliation, 24 November 2026

Milestone 6A remains **OPEN**; 6B/6C remain **PAUSED**. The [CLI handoff and integration proposal review](pnyx-roadmap-reconciliation-2026-11-24.md) reconciles every supplied handoff item, all ten proposal sections and all fourteen PIRP labels. PIRP is a proposed classification of work, not a replacement roadmap or authorization to implement later modules.

Current GitHub main is `f7305ab`; the remediation branch was `6cbf5ef` before this documentation update, eleven commits ahead. Its application fixes at `fa7a291` have passing recorded native CI, but are not merged into main. The supplied older production READY claim does not verify that these corrections are live. Vercel lookup of the supplied deployment currently returns 404; current production SHA is unverified. Production media reports `enabled: false` on 24 November.

Next: preserve/recover the Windows checkout, strengthen positive test-target isolation, complete real isolated R2 acceptance, reverify the final candidate and resolve release access/identity. Then close 6A with evidence, execute 6B and 6C, and implement reviewed integration contracts after the existing Milestone 6 gate. Contract design can proceed now. Windows reset/bulk staging/main-push instructions are superseded by the preservation-first recovery sequence in the review.

All test/audit counts below belong to their recorded runs. No fresh application test suite or dependency scan was run for this documentation reconciliation. The November 3 full audit retained thirteen moderate development-tool findings even though its production audit was clean.

## Evidence update, 25 October 2026

Phase 1–10 remediation is committed at `0c64c3d` on `audit/pnyx-remediation-20261025`. Verified local evidence: TypeScript/lint/build pass, 64 unit tests, 51 browser checks, 77 responsive combinations, and zero known dependency advisories. Three R2 tests remain skipped. These results supersede the older public-route counts below without claiming production acceptance.

[Native PostgreSQL verification](native-postgres-verification-2026-10-25.md) now passes: all 12 migrations replayed without schema drift, nine HTTP integration scenarios passed, and CI passed 70 unit tests plus TypeScript/lint/build. It exposed and verified a fix for a real two-session Join race that previously returned HTTP 500. The next gate is isolated R2 avatar/banner verification, followed by the remaining Milestone 6A acceptance evidence. Milestones 6B/6C remain gated.

## UI/UX update, 30 October 2026

The [search and writing-surface refresh](uiux-search-2026-10-30.md) moves search first on Explore, connects header queries, modernizes shared fields, improves filter disclosure/error recovery/pagination, restores missing component foundations, and removes invented auth activity counts. Automated verification is recorded with that report. A [follow-up visual review](uiux-visual-review-2026-10-30.md) now covers the private fixture preview and fixes dark-profile contrast, avatar initials, mobile account naming, and cramped composer layout. Real-device/screen-reader QA remain open. The isolated R2 gate and remaining Milestone 6A work are still pending.

## End-to-end/profile update, 3 November 2026

The [end-to-end/profile review](end-to-end-profile-review-2026-11-03.md) closes verified visibility leaks, strengthens restricted-source reuse, repairs profile editing/media ownership, restores draft recovery, and improves network failure handling. Its verification record distinguishes disposable local PGlite checks from native PostgreSQL CI and leaves live R2 acceptance, durable cleanup retries, real-device/screen-reader QA, and the broader Milestone 6 gates open. Native PostgreSQL CI now passes 27 scenarios with all 12 migrations and no drift for `fa7a291`. Deployment was attempted but Vercel rejected production creation with HTTP 403; restoring connection permission is the remaining deployment blocker. Full dependency audit retains 13 moderate development-tool reports; production audit is clean.

## Implemented milestones and foundations

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
