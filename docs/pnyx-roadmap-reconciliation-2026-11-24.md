# Pnyx roadmap reconciliation — 24 November 2026

## Decision

Continue the existing roadmap: Milestone 6A remains OPEN; 6B and 6C remain PAUSED. Treat PIRP-0 through PIRP-13 as proposed workstream labels mapped to that roadmap, not a second set of milestones or permission to bypass release gates. This review reconciles the supplied handoff and proposal; it does not certify all future integration capabilities.

The immediate delivery problem is the gap between the older main branch and the later verified remediation branch, together with disabled storage and unfinished acceptance. New engines do not solve those blockers.

## Sources and present identity

- Supplied CLI handoff, quoted in the current conversation. Its date was not supplied.
- Supplied Pasted text.txt: all 317 lines reviewed; SHA-256 b1c8238d66b2e603db833178e9bdc6f534f3ec4f3722d58dbf78e3deb22f7023. It is a proposal, not implementation evidence.
- GitHub heads re-read on 24 November: main is f7305ab0a825f565bde16d7d41d46639b904fd35; audit/pnyx-remediation-20261025 is 6cbf5ef68b099c7ad59e80d2125929b743e8c360 before this documentation update. Main is an ancestor of that branch, with 11 later commits.
- Verified application correction commit: fa7a291b300a2059732c013a3bccb8e14d02e598. Its documentation follow-up is 6cbf5ef. These are not merged into main.
- [Native PostgreSQL CI 41602584952](https://github.com/kellyxy110/Pnyx/actions/runs/41602584952) was re-read: SUCCESS for fa7a291. This is historical execution evidence, not a fresh November 24 test execution.
- [November 3 report](end-to-end-profile-review-2026-11-03.md) and its [machine-readable results](end-to-end-profile-review-2026-11-03-results.json).
- Current roadmap, tasks, Definition of Done, storage/media code, authentication, content policies, API routes, moderation, AI, analytics, schema, browser guards, Next headers, and release configuration.
- Read-only production GET /api/account/profile/media returned HTTP 200 with enabled: false on November 24. This establishes the application reports media disabled; it does not identify which individual R2 variables are missing or prove provider health.
- Vercel inspection of supplied deployment dpl_4WfHYhSFe39pr7iitv9XjPNA9N8q returned HTTP 404 through the current connection. Its historical READY state and the current production commit cannot be independently confirmed from that response. A 404 is not proof that a historical deployment never existed or that production is down.

The selected Linux checkout is clean and readable at the recorded remediation head. That says nothing about the Windows checkout's ACLs or index. No Windows filesystem was accessed.

## CLI handoff: line-by-line decisions

| Handoff item | Reconciliation | Decision |
| --- | --- | --- |
| Resumed and verified the state | Describes the CLI session at an unspecified time. | Preserve as historical testimony, not current certification. |
| Storage upload consistency fixes | Main f7305ab contains putImage and database update handling. Later remediation adds serialized media pointer changes and decoded raster checks. | Retain both generations; do not rebuild storage. |
| Orphan-upload cleanup on database failure | Main catches update failures, but reads the old pointer before that catch. Later remediation also covers failure of pointer persistence and concurrent swaps. | Use remediation implementation as the candidate. Durable retry/reconciliation remains open. |
| Storage configuration tests | Main includes three configuration/URL tests. Later media-route tests exercise decoding and cleanup paths with mocked storage. | Unit coverage is not an R2 upload acceptance test. |
| Guarded authenticated Playwright journeys | Test files exist; later isolated browser runs passed. Older guard excludes one production hostname only. | Require positive target isolation before the next authenticated/media test batch. |
| Spaces accessibility fix | Exists in the baseline; later UI checks cover further responsive/account naming issues. | Preserve; do not mark physical-device or screen-reader acceptance complete. |
| Auth contrast and reduced-motion fixes | Existing auth/browser evidence supports those corrections. | Preserve and rerun affected checks when code changes. |
| Production deployment READY | User supplies a deployment ID and older code SHA. Current provider lookup is inaccessible. | Record historical reported READY, separately from current release verification. |
| Unit tests 60/60 | Plausible older scope. Later recorded suite has 88 passing tests. | Keep dated, commit-specific counts; never add counts from different runs. |
| TypeScript and ESLint pass | Historical CLI result; also passed for later remediation in CI. | Run again for any new application candidate. |
| Desktop public Playwright 8/8 | A narrow public-route suite, not full authenticated acceptance. | Later recorded browser evidence is 90 passed, three R2 skips, across configured devices. Neither number closes every 6A gate. |
| Latest deployed commit f7305ab | GitHub main still points to that SHA. A branch head alone does not prove a production alias's current commit. | Call it the reported deployed baseline until Vercel metadata verifies production identity. |
| Deployment ID dpl_4WfHYhSFe39pr7iitv9XjPNA9N8q | Current Vercel lookup returns 404. | Retain ID; classify present status unverified. |
| Production URL pnyx-psi.vercel.app | Public site is retrievable; media endpoint responds. | Availability does not establish the deployed SHA or healthy authenticated workflows. |
| R2 variables not configured | Current media endpoint reports disabled. Exact variable/provider state was not inspected. | Keep the media gate open; configure an isolated test target first. |
| Authenticated journeys need isolated target/account | Correct operational prerequisite. Later disposable local journeys already ran successfully. | Stop calling all authenticated testing unexecuted; hosted/provider-backed acceptance remains open. |
| Local Git index corrupt; .git read-only | Windows-specific statement, not remotely verified. | Preserve Windows files and metadata before any repair; a separate healthy clone is the preferred recovery option. |
| Working files intact | Supplied claim, not a verified backup. | Verify a recoverable backup before index mutation. |
| Could not commit documentation | Applies to that Windows session. Remediation evidence was committed through GitHub afterward. | Compare the exact loose documentation against current branch before carrying it forward. |
| Grant current Windows user Modify on .git | May address ACL denial, not necessarily index corruption. | Inspect ownership/ACLs first; grant only the intended user, not Everyone or broad full control. |
| git reset --mixed HEAD | Rebuilds index state and unstages changes; does not preserve staging distinctions. | Do not run before backup, branch/head checks and confirmed index diagnosis. Avoid if a clean sibling clone resolves the task. |
| git add -A | Can stage unrelated source, deletions and sensitive loose files. | Replace with reviewed, explicit file paths. |
| git commit docs message | Appropriate only if the staged diff is documentation only. | Validate the diff and evidence first; use a message matching actual scope. |
| git push origin main | Conflicts with the continuing remediation branch constraint; may trigger production deployment. | Do not execute. Commit reviewed work only to audit/pnyx-remediation-20261025. |
| 6A open; 6B/6C paused | Matches repository gate structure. | Maintain this ordering. Scoped security corrections already needed for 6A do not imply 6B is complete or opened. |

## Safe Windows recovery sequence

1. Stop active Git operations. Make and verify a separate recoverable copy of the entire original checkout, including untracked files and Git metadata. Keep secrets in protected local storage; do not upload this backup.
2. Record the Windows account, repository path, current branch/head if readable, remote, pending files and current ACLs. Diagnose read-only metadata and corruption separately.
3. Prefer a new sibling clone of the existing remediation branch. Compare loose working files against the recovered branch and carry forward only reviewed missing changes. Do not copy the damaged .git, credential files, environment files or dependencies into the clean clone.
4. If repairing the original index is necessary, review ownership, apply narrowly scoped Modify permission for the current user, preserve the original index, and rebuild only after checking HEAD. A mixed reset loses staging distinctions even when worktree files remain.
5. Review changed and deleted files, stage explicit approved paths, inspect the staged diff, verify the relevant checks, and commit on the remediation branch. No push to main, merge, or automatic production release is part of this procedure.

## Attachment section 1: foundations (lines 9–28)

| Proposed area | Existing evidence | Gap / decision |
| --- | --- | --- |
| Authentication | Auth.js credentials, conditionally enabled Google/GitHub, recovery, OAuth account persistence, session identity/suspension checks. | Live provider acceptance and broader failure/security coverage remain; no cross-product SSO claim. |
| Authorization | Shared content-access policies and multi-user native integration tests on remediation. | Later fixes are not merged into main; future public APIs must apply the same privacy boundaries with independent contract tests. |
| API architecture | Unversioned first-party posts, Spaces, knowledge and search APIs. | They are not a stable integration contract. Public response minimization, limits, compatibility and withdrawal behavior need design and implementation after gates. |
| Database | Prisma, 12 migrations, relational indexes, clean native replay. | Migration replay is not a data backup/restore exercise or query/load benchmark. |
| Moderation | Reports, queues, actions, audit records, appeals, blocks, suspension and basic rate limits. | No demonstrated scam/phishing/impersonation or coordinated-manipulation engine. |
| Media | R2-compatible abstraction, normalization, serialized pointer changes, cleanup code/tests. | Disabled in production; isolated provider acceptance and durable cleanup remain open. |
| Mobile | Responsive shell and browser emulation evidence. | Physical devices and Telegram host behavior have not been certified. |
| Performance | Bounded post/knowledge/search pagination and database indexes. | Spaces listing is unbounded; no measured load budget, public integration quota or cache invalidation contract is established. Measure before adding shared caches. |
| Analytics | AnalyticsEvent, AuditEvent, knowledge events and metric definitions. | No verified cross-product event schema, deduplication or analytics consent/retention contract. Audit all emitters; generic analytics opt-out is not sufficient evidence for every direct emitter. |
| Accessibility | Automated axe/focus/contrast/reduced-motion evidence. | Manual screen-reader, real-device and release QA remain open. |
| SEO/GEO/AEO/DEO | Root metadata, readable routes and public content. | No implemented per-content sitemap, canonical/structured-data system found in inspected app routes. External visibility evaluation is proposed, not an existing SiteNexis service connection. |

## Attachment section 2: Integration Engine (lines 29–87)

Keep this as one future integration boundary inside Pnyx initially, rather than assuming a separately deployed service is needed.

| Proposed capability | Status / decision |
| --- | --- |
| Public content API | First-party APIs exist; a minimal, public-only versioned contract is new work. |
| Spaces API | Existing public list/detail routes can supply domain logic; bound list size and explicitly select contract fields. |
| Knowledge API | Published artifact retrieval exists; expose only permitted published content, safe source attribution and links. |
| Search API | Existing keyword search/filter logic can be reused; query/cost caps and predictable result envelopes are needed. |
| Identity linking | Deferred. Same email, username or Telegram identity is not proof of permission to link accounts. |
| Event API | Deferred until consent, producer identity, deduplication and retention are defined. |
| Webhooks | No delivery/outbox implementation found. Later design must cover signing, replay protection, retries, ordering, withdrawal and dead letters. |
| Integration registry | No approved-app registry found. Add only when identified application/quota management requires it. |
| Permission scopes | Future service permissions are distinct from ordinary user roles; no existing scope system is claimed. |
| Audit logs | Existing domain audit utility is reusable; integration access/delivery audit coverage is new work. |
| Developer documentation | Future endpoint/response/version/error/limit examples need contract tests. |
| Integration health | Existing application health checks are a foundation; no certified consumer/delivery health workflow. |

Read-only must mean public-only reads and no cross-product write authority. It does not mean authenticated private profile data may be copied to another application. Internal GET handlers may have analytics side effects; define public API side-effect and consent behavior explicitly.

Proposed first contract, for design review only: public Spaces, public discussions, published public knowledge and bounded keyword search. Use explicit fields such as content ID, title, excerpt, canonical Pnyx link, public attribution, Space, publication/update timestamp and status. Exclude email, tokens, drafts, private memberships and personalized viewer state. Define removal, moderation, staleness, retention and attribution rules before content is cached downstream. No API names, tokens, migration, registry, or service are implemented by this document.

## Attachment section 3: Knowledge Intelligence (lines 88–125)

The existing discussion-to-artifact workflow, revisions, sources, contributor attribution, AI outputs and human-controlled publication are the reusable foundation. The proposed sequence is sound as a product direction, but storage of a source or a VERIFIED status is not independent evidence that a claim is true.

Freshness monitoring, source retrieval/credibility assessment, conflicting-claim detection, structured topic relationships and correction evidence are future additions. RELATED AI output is not a certified duplicate-detection index. Source suggestions currently generate documentation search terms, not a verified fact-checking service. Require evaluation fixtures, provenance and permission tests before expanding these functions. Groq assistance has per-request limits/timeouts/retries; this does not establish multi-provider portability or an aggregate spend-control service.

## Attachment section 4: Trust and Safety (lines 126–148)

| Proposed capability | Decision |
| --- | --- |
| Scam detection | Future feature; build and evaluate known-pattern/report triage before claiming detection accuracy. |
| Malicious-link screening | Future; define safe URL processing and phishing review. No arbitrary server-side fetch of user URLs. |
| Spam detection | Basic rate limiting exists; this is not a trained spam classifier or complete abuse defense. |
| Impersonation detection | Future; reviewable identity evidence and appeals are required. |
| Contributor reputation | Future; useful contribution is not a guarantee of claim correctness. |
| Source credibility indicators | Future; explain evidence and uncertainty rather than assign unsupported trust scores. |
| AI disclosure | Policy/output provenance exists; do not infer universal detection of AI-authored content. |
| Coordinated manipulation | Future; no established graph/detector or evaluation baseline. |
| Moderation intelligence | Existing queue and rate-limit audit review are a base; advanced prioritization is unproven. |
| Appeals/transparency | Existing appeals and audited actions should be extended, not replaced. Review actual appeal rights and outcomes before promising fairness guarantees. |

## Attachment section 5: Telegram/mobile (lines 149–184)

Responsive Pnyx web is implemented. The image links are inspiration, not Pnyx screenshots or proof of Telegram functionality. The web manifest is an asset, not proof of offline PWA operation or installability acceptance. No Telegram initData verification, identity linking or host lifecycle implementation was found in Pnyx.

Next config currently sends X-Frame-Options: DENY to every route. Direct iframe embedding would require a deliberate route-specific framing decision and browser verification; do not remove this global protection simply to integrate. Opening Pnyx as a separate web destination is distinct from rendering a compact public community view in NexisHub. Establish public read contracts first, then certify the chosen host flow, safe links, mobile keyboard, theme, viewport, back navigation and failure recovery.

## Attachment section 6: Community Intelligence (lines 185–207)

Community health, knowledge quality, unanswered questions, emerging topics, Space health, contributor usefulness, content gaps, moderation trends, discovery success and referral attribution are proposed measurement use cases. Existing event tables and beta metric definitions are foundations, not proof these ten analyses run accurately.

Define events from real actions, denominators and time windows; deduplicate retries, distinguish bots, respect consent/retention, and measure missing data. Start with existing moderation and unanswered-question work rather than ten new dashboards. Pnyx owns community events; cross-product aggregate sharing with NexisMetrics needs a documented contract. Neither NexisMetrics nor Nexis Marketing Intelligence is verified as implemented by this Pnyx review.

## Attachment section 7: proposed ecosystem features (lines 208–229)

| Proposal | Present foundation / timing |
| --- | --- |
| Expert directories | Public people discovery exists; expert verification is not implemented. Later extension. |
| Project showcases | SHOWCASE post type exists; a dedicated project portfolio system is additional work. |
| Research collaboration | RESEARCH posts/artifacts exist; structured collaboration matching is later backlog. |
| Community challenges | New future module tied to demonstrated demand. |
| Events/workshops | Existing later backlog; retain its gate. |
| Learning collections | Existing later backlog; TeachNexis integration remains a proposal. |
| Open-source discussions | Ordinary posts/Spaces can host them now; automated repository integration is future work. |
| Organization profiles | Existing later backlog; verification requires its own evidence model. |
| Product feedback Spaces | Existing Spaces/discussions may support a manual pilot after readiness; no special integration service is required initially. |
| Bug/feature discussions | Existing question/discussion types can support manual use; tracker synchronization is future work. |
| Public knowledge feeds | API contract and downstream withdrawal rules are new work. |
| Newsletters | Bulk delivery, preferences, unsubscribe and consent are not established by transactional email code. |
| Sponsored educational events | Deferred with events/monetization and associated disclosure rules. |

## Attachment section 8: SiteNexis (lines 230–263)

Use SiteNexis as a future external evaluator of permitted public pages. Naming or linking a product in the footer does not certify backend integration. Indexing/crawlability, structured data, attribution, internal linking, duplicate/canonical policy, performance and machine-readable resources need separate evidence. Private pages must be denied at the data boundary; robots directives alone are not authorization. Keep canonical discussion/knowledge ownership and attribution in Pnyx. No SiteNexis repository, protected worktree or production system was changed.

## Attachment section 9: all 14 PIRP workstreams (lines 264–286)

| Label | Existing roadmap placement | Present status and sequencing |
| --- | --- | --- |
| PIRP-0 Reconciliation | Roadmap maintenance now | This scoped source/handoff reconciliation is recorded; operational/provider gaps are explicit. |
| PIRP-1 Core reliability | 6A | Active: media, controlled acceptance and release identity. |
| PIRP-2 Authorization/security | 6A corrections; full 6B after 6A | Corrections exist on remediation; full security/abuse certification remains open. |
| PIRP-3 Public integration API | Later public API backlog | Architecture/contracts may be drafted now; implementation remains gated by Milestone 6. |
| PIRP-4 Performance/resilience | 6B | Pagination/index foundations exist; load, restore and recovery remain open. |
| PIRP-5 Telegram/mobile | 6A/6C mobile evidence; later host integration | Existing responsive UI is reusable; Telegram-specific implementation is future gated work. |
| PIRP-6 Knowledge intelligence | Milestone 3/4 foundations; later expansion | Preserve artifact/AI systems. New freshness/conflict/credibility functions are future work. |
| PIRP-7 Trust/safety | Existing moderation; 6B; later advanced modules | Finish release-critical safety, then assess detectors with evidence. |
| PIRP-8 Community/events | Existing beta metrics; later public event contracts | Start with reliable permitted measurements. Cross-product delivery is future work. |
| PIRP-9 Visibility | Core public-page hygiene; later SiteNexis integration | Define public indexing boundaries now; no certification claimed. |
| PIRP-10 NexisHub certification | After both products' applicable gates | Contract, privacy, host, outage and withdrawal tests needed. |
| PIRP-11 Account linking | Later identity integration | Explicit consent, reauthentication, unlinking, revocation and audit required. |
| PIRP-12 Closed beta | 6C | Recruitment and evidence remain paused by the existing ordering. |
| PIRP-13 Monetization | Later monetization/events backlog | Deferred. No advertising or promotion automation authorized here. |

PIRP numbering is a classification, not a linear dependency schedule. In particular, safety prerequisites precede external integration, and later trust tooling does not justify skipping baseline security. Preserve the existing Definition of Done rather than replacing it with broad engine names.

## Attachment section 10: two tracks (lines 287–317)

Keep NexisHub and Pnyx source, deployment and test data separate. The attachment's instruction to complete NexisHub S21 is not a verified current NexisHub status or an instruction to change that repository in this task. NexisReach reconciliation, the five-tab Mini App design and Telegram certification belong to their own project records. Pnyx can plan compatible public contracts while its own core product is completed. Cross-product implementation begins only after both applicable release gates and a reviewed integration contract.

## Concrete next batches

| Order | Batch | Acceptance needed |
| --- | --- | --- |
| 1 | Preserve Windows work and select remediation candidate | Recoverable backup or healthy sibling clone; no missing loose changes; exact source identity; no blanket staging or main push. |
| 2 | Complete 6A test-target guards and isolated media acceptance | Positive app/database/storage isolation; dedicated account; real avatar/banner upload, replacement/removal, reload and cleanup; failure/concurrency evidence; no production fixture writes. |
| 3 | Reverify and release the candidate | Fresh dependency/type/lint/unit/build/HTTP/browser checks appropriate to final changes; verified Vercel target/permission, rollback and migration review; controlled acceptance and explicit release record. Historical READY is insufficient. |
| 4 | Close 6A only when its outstanding checkboxes have evidence | Storage operational evidence and production-adjacent browser acceptance included. A guarded test file alone does not satisfy the gate. |
| 5 | Execute 6B, then 6C | Load/recovery, actual backup restore, deletion propagation, security/abuse; then manual release QA and closed-beta evidence. |
| 6 | Implement the reviewed read-only integration boundary | After Milestone 6, test public-only responses, quotas, attribution, withdrawal and consumer failure behavior; then certify the NexisHub view. |
| 7 | Consider linking, intelligence expansion and monetization | Separate evidence, consent and product-demand gates. |

New source observation for batch 2: authenticated-journeys.spec.ts rejects only the canonical production URL. Another production alias could pass. profile-workflow.spec.ts requires loopback app origin but does not itself prove the backing database is disposable. The native PostgreSQL target guard is stronger. Before the next browser/media execution, reuse a positive isolation contract for the app, database and storage rather than relying on hostname exclusion alone. No new live media tests were run during this documentation review.

## Roadmap corrections made by this review

Current roadmap/checklist/task references now point to the later evidence, with its November 3 date. Older July/October reports remain historical. The statement that native CI had zero known vulnerabilities has been qualified: November 3 production audit was clean while the complete audit retained 13 moderate development-tool reports. No November 24 dependency scan or fresh application test run is claimed. Semantic retrieval remains deferred; keyword search does not prove embeddings or a semantic index exist.

Only documentation changes belong to this review. Application code, migrations, environment variables, the supplied attachment, Windows permissions, production data, main and deployment settings were not modified. Validation covers source/branch reconciliation, recorded CI status, the read-only media response, Markdown links and the documentation diff.
