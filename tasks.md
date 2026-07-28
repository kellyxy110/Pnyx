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

- [ ] Build post composer with post types, Markdown, code blocks, links, images, polls, drafts, and validation.
- [ ] Build feed views for Following, Latest, and Space discussions.
- [ ] Implement replies, mentions, reactions, saves, edits, deletion, sorting, and pagination.
- [ ] Implement question/answer state and accepted answer behavior.
- [ ] Add post/report/block/mute flows with confirmation and recovery states.
- [ ] Add notification center for replies, mentions, follows, accepted answers, and moderation decisions.
- [ ] Test content permissions, deletion behavior, rate limits, and abuse edge cases.

## Milestone 3 — Knowledge layer

- [ ] Design and implement knowledge artifact schema with authors, contributors, sources, revisions, status, and originating discussion.
- [ ] Add “Convert to knowledge artifact” workflow from an answer or discussion.
- [ ] Build reading and editing experiences for guides, answers, research notes, benchmarks, and case studies.
- [ ] Add draft/published/community-reviewed/verified statuses and revision history.
- [ ] Add source entry, citation display, related discussions, related Spaces, and report/correction flow.
- [ ] Measure artifact creation, reading, saving, sharing, and correction rates.

## Milestone 4 — AI assistance

- [ ] Create provider-agnostic AI orchestration interface with timeouts, retries, cost limits, and graceful fallback.
- [ ] Generate optional post summaries and suggested tags.
- [ ] Suggest related/duplicate discussions using permission-aware retrieval.
- [ ] Extract and display source/documentation suggestions with clear confidence and provenance.
- [ ] Assist drafting artifacts only from user-selected content and preserve contributor attribution.
- [ ] Store model/version, prompt policy version, source IDs, generation time, and output status.
- [ ] Add user correction, feedback, report, and disable-AI controls.
- [ ] Evaluate quality, latency, cost, privacy leakage, and hallucination/report rates before expanding automation.

## Milestone 5 — Search and discovery

- [ ] Implement indexed search over public Spaces, posts, replies, profiles, and artifacts.
- [ ] Add filters for content type, Space, author, date, and verification status.
- [ ] Add result explanations and empty/no-results recovery.
- [ ] Add semantic retrieval only after keyword search has observable baseline metrics.
- [ ] Exclude deleted, private, blocked, and restricted content from indexes and caches.
- [ ] Add ranking evaluation set and monitor relevance, diversity, freshness, and safety.

## Milestone 6 — Beta readiness

- [ ] Build moderation queue, moderator actions, audit log, appeals, and escalation paths.
- [ ] Add spam prevention, rate limits, suspicious-activity review, and abuse monitoring.
- [ ] Run accessibility audit and keyboard/screen-reader usability pass.
- [ ] Run responsive/mobile audit across core flows.
- [ ] Add load, failure recovery, backup/restore, deletion propagation, and security tests.
- [ ] Instrument success metrics from `prd.md` and document metric definitions.
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

## Release gates

Before public launch, Pnyx must demonstrate a reliable question-to-useful-answer flow, safe and permission-aware discovery, understandable AI provenance, usable moderation, accessible core flows, recoverable data, and evidence that users return for knowledge—not only notifications.
