# Pnyx Delivery Tasks

This is the initial implementation backlog. Work from top to bottom unless a dependency or validated product learning changes the order. Each task should become smaller implementation tickets when development begins.

## Milestone 0 — Product and technical foundation

- [x] Create repository structure and choose the initial web application stack.
- [x] Define environment configuration, secrets handling, code quality checks, and CI.
- [x] Establish domain modules: identity, profiles, Spaces, content, knowledge, search, AI, moderation, notifications, and analytics.
- [x] Define database entities and migration strategy for users, Spaces, posts, replies, artifacts, sources, revisions, reports, and permissions.
- [x] Define public/private/restricted visibility and authorization rules.
- [x] Write initial community guidelines, AI disclosure policy, content policy, and appeal policy.
- [x] Create design tokens, typography scale, spacing scale, semantic colors, and accessible component conventions.
- [x] Add error tracking, structured logging, audit events, health checks, and privacy-safe analytics.

## Milestone 1 — Identity and Spaces

- [x] Implement registration, authentication, recovery, session management, and account deletion.
- [x] Implement profile creation/editing, avatar handling, links, expertise categories, and privacy controls.
- [x] Implement Space creation/seeding, browsing, following, joining, leaving, rules, moderators, and featured resources.
- [x] Seed initial Spaces and subtopics across AI, Programming, Web, Mobile, Cloud, Data, Cybersecurity, Design, Business, Education, and Hardware.
- [x] Add permission tests for user, Space member, moderator, and administrator roles.

## Milestone 2 — Discussion loop

- [x] Build post composer with post types, Markdown, code blocks, links, images, polls, drafts, and validation.
- [x] Build feed views for Following, Latest, and Space discussions.
- [x] Implement replies, mentions, reactions, saves, edits, deletion, sorting, and pagination.
- [x] Implement question/answer state and accepted answer behavior.
- [x] Add post/report/block/mute flows with confirmation and recovery states.
- [x] Add notification center for replies, mentions, follows, accepted answers, and moderation decisions.
- [x] Test content permissions, deletion behavior, rate limits, and abuse edge cases.

## Milestone 3 — Knowledge layer

- [x] Design and implement knowledge artifact schema with authors, contributors, sources, revisions, status, and originating discussion.
- [x] Add “Convert to knowledge artifact” workflow from an answer or discussion.
- [x] Build reading and editing experiences for guides, answers, research notes, benchmarks, and case studies.
- [x] Add draft/published/community-reviewed/verified statuses and revision history.
- [x] Add source entry, citation display, related discussions, related Spaces, and report/correction flow.
- [x] Measure artifact creation, reading, saving, sharing, and correction rates.

## Milestone 4 — AI assistance

- [x] Create provider-agnostic AI orchestration interface with timeouts, retries, cost limits, and graceful fallback.
- [x] Generate optional post summaries and suggested tags.
- [x] Suggest related/duplicate discussions using permission-aware retrieval.
- [x] Extract and display source/documentation suggestions with clear confidence and provenance.
- [x] Assist drafting artifacts only from user-selected content and preserve contributor attribution.
- [x] Store model/version, prompt policy version, source IDs, generation time, and output status.
- [x] Add user correction, feedback, report, and disable-AI controls.
- [x] Evaluate quality, latency, cost, privacy leakage, and hallucination/report rates before expanding automation.

## Milestone 5 — Search and discovery

- [x] Implement indexed search over public Spaces, posts, replies, profiles, and artifacts.
- [x] Add filters for content type, Space, author, date, and verification status.
- [x] Add result explanations and empty/no-results recovery.
- [x] Add semantic retrieval only after keyword search has observable baseline metrics.
- [x] Exclude deleted, private, blocked, and restricted content from indexes and caches.
- [x] Add ranking evaluation set and monitor relevance, diversity, freshness, and safety.

## Milestone 6 — Beta readiness

- [x] Build moderation queue, moderator actions, audit log, appeals, and escalation paths.
- [x] Add spam prevention, rate limits, suspicious-activity review, and abuse monitoring.
- [x] Run automated accessibility audit and keyboard/focus regression tests.
- [x] Run responsive/mobile audit across public core flows.
- [ ] Add load, failure recovery, backup/restore, deletion propagation, and security tests.
- [x] Instrument success metrics from `prd.md` and document metric definitions.
- [ ] Recruit a small set of learners, engineers, researchers, maintainers, and moderators for closed beta.
- [ ] Review beta evidence and decide whether to expand, narrow, or revise scope.

## Later backlog — Do not pull into MVP without evidence

- [ ] Organisation verification and organisation pages.
- [ ] Learning collections, roadmaps, and courses.
- [ ] Event pages, workshops, hackathons, and live discussion support.
- [ ] Collaboration requests and project matching.
- [ ] Jobs, freelance work, internships, and recruiting tools.
- [ ] Public API, integrations, GitHub/StackBlitz/Figma/YouTube embeds, and developer tooling.
- [ ] Multilingual translation and advanced accessibility assistance.
- [ ] Native mobile applications, enterprise communities, and marketplace.

## Cross-milestone release work

- [x] Redesign the premium email/password authentication experience, including responsive UX, inline validation, accessibility foundations, assets, and tests.
- [ ] Configure Google OAuth credentials in Vercel Production and Preview.
- [ ] Configure GitHub OAuth credentials in Vercel Production and Preview.
- [ ] Run manual Lighthouse accessibility QA.
- [ ] Run manual screen-reader QA.
- [ ] Complete manual screen-reader usability pass.
## Release gates

Before public launch, Pnyx must demonstrate a reliable question-to-useful-answer flow, safe and permission-aware discovery, understandable AI provenance, usable moderation, accessible core flows, recoverable data, and evidence that users return for knowledge—not only notifications.

## Milestone 6A — Core product completion (active)

- [x] Add global session-aware navigation, user menu, avatar fallback, notification count, profile link, notifications link, and sign-out.
- [x] Build the shared responsive three-column application shell.
- [ ] Complete profile identity, activity, followers/following, and real avatar/banner storage. (Identity fields, media service, migration, and feature-gated controls implemented; production R2 configuration and end-to-end media verification remain.)
- [ ] Complete authenticated community feed, composer, drafts, publishing, and discussion actions.
- [ ] Complete user following and feed impact.
- [ ] Complete Space detail, membership, members, moderators, rules, and pinned content.
- [ ] Complete Knowledge reading/index surfaces with sources, citations, related content, and revisions.
- [ ] Complete Explore discovery, trending, filters, recommendations, and pagination.
- [ ] Complete truthful AI assistance surfaces backed by supported APIs only.
- [ ] Add authenticated Playwright journey coverage and production evidence.

## Milestone 6B — Resilience and security (paused until 6A closes)

- [ ] Load and failure-recovery testing.
- [ ] Backup/restore verification.
- [ ] Deletion propagation verification.
- [ ] Security and abuse testing.

## Milestone 6C — Closed beta readiness (paused until 6A closes)

- [ ] Manual Lighthouse, screen-reader, and real-device QA.
- [ ] Closed-beta recruitment, consent, feedback, and evidence review.
