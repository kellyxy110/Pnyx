# Pnyx public discovery contract v1 — review draft

Date: 24 November 2026. Design revision: 0.1.0. Status: DRAFT, NOT IMPLEMENTED.

This contract defines a future read-only public discovery boundary with NexisHub as the initial proposed certified consumer. It does not create API routes or authorize deployment, account linking, cross-product writes, advanced intelligence execution or monetization. Milestone 6A stays open; 6B/6C stay paused; public integration implementation remains after the existing Milestone 6 gate.

Companions: [OpenAPI draft](pnyx-public-integration-v1.openapi.json), [synthetic schema examples](pnyx-public-integration-v1.examples.json), [acceptance matrix](pnyx-public-integration-v1-acceptance.md), [roadmap reconciliation](pnyx-roadmap-reconciliation-2026-11-24.md).

## Product behavior and ownership

NexisHub can show public Pnyx Space cards, discussion cards, published knowledge cards and bounded keyword results. Each card contains a title/name, short plain-text excerpt, permitted attribution and a canonical Pnyx link. Reading the full discussion, replies, revisions, sources and participation remains on Pnyx in v1. A failed integration shows an unavailable state, not invented activity or substitute private data.

Pnyx owns content eligibility, moderation, source relationships, publication status and canonical URLs. The consumer owns safe rendering, its short-lived display state, deadlines and prompt removal of unavailable cards. The consumer must identify the source as Pnyx and provide an accessible “Read on Pnyx” action. Editorial VERIFIED is a Pnyx workflow label, not an independent guarantee of truth.

The source API in this draft is anonymous and public. Consumer certification controls the supported NexisHub integration, not who can make a public HTTP request. It is not an approved-app-only access registry; such a requirement would need a separately reviewed machine-authentication contract without user impersonation.

The first boundary can be a module within the existing Pnyx application. No separate microservice, new dashboard, additional identity provider or integration database is assumed. Contract design does not certify the current main or production deployment as a suitable source.

## Proposed transport boundary

Pnyx public API → NexisHub server adapter → existing NexisHub display surface → canonical Pnyx page.

The adapter calls a release-verified HTTPS Pnyx origin without a user session. It never forwards Cookie, Authorization, Telegram initData, end-user identity or arbitrary forwarded network headers. Browser requests use NexisHub's own server boundary. Direct cross-origin credentialed browser access is outside v1; no CORS credential grant or framing-policy relaxation is needed. Existing Pnyx X-Frame-Options protection remains.

User blocks and mutes are personalized controls, not an anonymous-public permission system. v1 does not promise cross-product enforcement of an individual user’s blocks/mutes; global suspension, moderation and visibility still apply. A consumer requiring personal access decisions needs a later approved identity contract.

All API operations evaluate anonymous public access even if a same-origin caller happens to send Pnyx cookies. Inbound session/authorization material is discarded, never consulted or logged, and never forwarded. Responses do not set cookies. No shared cookies, cross-product login or service token is introduced. A future quota key would require its own review; it must not confer user impersonation rights.

GET reads cannot create/edit/publish content, follow/join, send notifications, trigger AI or produce user-engagement analytics. Minimal operational quota counters and request diagnostics are distinct from cross-product business writes and may be necessary to enforce this boundary.

## Proposed endpoints

All seven routes below are design names only. The reserved example server in OpenAPI deliberately does not resolve to production.

| GET path | Returned resource | Optional filters |
| --- | --- | --- |
| /api/public/v1/spaces | Public Space cards | limit, cursor |
| /api/public/v1/spaces/{slug} | One public Space card | None |
| /api/public/v1/discussions | Public, published, nondeleted discussion cards | space, type, limit, cursor |
| /api/public/v1/discussions/{id} | One eligible discussion card | None |
| /api/public/v1/knowledge | Published public knowledge cards | space, type, status, limit, cursor |
| /api/public/v1/knowledge/{id} | One eligible knowledge card | None |
| /api/public/v1/search | One kind of public cards | kind and q required; space, limit, cursor optional |

Search kind is spaces, discussions or knowledge. Mixed-kind results, profiles, replies, user filters, arbitrary date/sort expressions, bulk exports and full bodies are outside v1. The space filter is invalid for kind=spaces. Keyword matching is literal and case-insensitive over permitted fields, without regex, semantic expansion or AI execution. Match discussion title/body, knowledge title/summary/body, and Space name/slug/description only after the resource eligibility predicate is applied in the same query. Excerpts remain bounded even when a match occurs elsewhere in the public body.

No unknown or repeated query parameters are accepted. Decode/normalize once, trim q, then enforce 2–120 Unicode code points. Wildcard characters must remain literal; parameterization and correct LIKE escaping are implementation requirements. A space filter naming an unknown/private Space yields an empty list without revealing its existence.

Only GET is specified as an application operation. HEAD may return corresponding headers without a body and must apply the same eligibility/no-side-effect rules. OPTIONS may describe safe methods without granting credentialed CORS. Other methods return 405 with Allow: GET, HEAD, OPTIONS; they never invoke existing write handlers.

## Data projection

The OpenAPI schemas are the exact field allowlists. Never return raw Prisma objects or republish existing first-party responses unchanged.

| Card | Allowed projection |
| --- | --- |
| Space | kind, opaque id, slug, name, excerpt, canonical url, updatedAt |
| Discussion | kind, opaque id, title, excerpt, canonical url, Space reference, permitted author attribution, type, createdAt, updatedAt |
| Knowledge | Discussion's common fields plus knowledge type, editorialStatus, nullable publishedAt and nullable originDiscussionUrl |

No emails, author IDs, OAuth identities, contact/profile fields, avatars, member/follower lists, counts, private memberships, personalized viewer flags, full bodies, replies, revision bodies, moderation notes, source URLs outside Pnyx, AI outputs or session data are exported. External image fetches and arbitrary citation URL fetching are outside this contract.

Author attribution exports displayName, username and profileUrl only when that author's profile is independently public and available to an anonymous reader. Otherwise return displayName “Community contributor”, username null and profileUrl null. Suspended/unavailable authors make their content ineligible. Do not promote a follower-only profile to public merely because a signed-in caller follows it.

All generated URLs use the verified configured Pnyx origin and encoded known resource paths. Never trust incoming Host/X-Forwarded-Host, user text or unvalidated database links to choose an origin. Only HTTPS canonical links under that Pnyx origin are allowed. A public profile link is conditional as above. originDiscussionUrl is nullable and can refer only to an independently eligible public originating discussion.

Excerpts are at most 280 Unicode code points and contain plain text only. Convert supported source markup to text without executing/rendering source HTML, links or scripts. Consumers render as text, not raw HTML. Literal code examples containing angle brackets remain inert text and must not become DOM elements. Use title/name limits from the schemas, with validated safe truncation for legacy records; do not invent missing timestamps. Discussion createdAt is record creation, not a claim about when a recovered draft was published. Knowledge publishedAt stays null if the source has no recorded publication timestamp.

## Eligibility and source dependency rules

Every list, detail, filter, search and cursor request recomputes eligibility against current authoritative data. Route IDs, cookies, cursor possession and previous successful reads never grant access.

- Space: isPublic true.
- Discussion: isDeleted false, isDraft false, visibility PUBLIC, containing Space public, author available. Reuse the logic of publicPostWhere without a viewer identity, with explicit projection.
- Knowledge: status PUBLISHED, COMMUNITY_REVIEWED or VERIFIED; visibility PUBLIC; containing Space public; author available; originating post/reply chain independently public, nondeleted and nondraft with available authors. Reuse publicArtifactWhere without viewer identity and strengthen its dependency behavior as needed below.
- Profiles: no profile enumeration endpoint. Author attribution is separately minimized according to public profile availability.
- Lists must filter at query time, before pagination. Do not fetch private records and remove them only during serialization.

Important schema gap: Artifact.sourcePost and sourceReply use ON DELETE SET NULL. After hard deletion, an originally linked artifact can look like a standalone artifact to a null-source filter. The current predicate alone therefore cannot prove safe publication lineage for that case. Before implementation, choose and test either a durable source-withdrawal marker/dependency record, an equivalent transactional unpublication policy covering all source deletion paths, or exclusion of records whose safe provenance cannot be established. Any migration needs its own existing roadmap review. Do not silently treat a lost source reference as proof of independent public origin.

Source content made private, drafted, deleted or moderated must remove dependent cards from this API. Suspension and profile visibility changes must invalidate content/attribution as specified. Unknown IDs and all forms of unavailable content return the same 404 envelope without deletion/private-state reasons or hidden counts. A database error is 503, not an empty successful list or 404.

Eligibility and projection must come from one consistent authoritative read, including source and attribution dependencies. A stale replica, stale materialized result or cached success must not override current withdrawal. Mark checkedAt no later than the start of that read; do not extend a lease by stamping the end of a slow query.

## Envelope, ordering and cursors

Success responses contain data and meta. meta carries apiVersion=1, requestId, kind, checkedAt and expiresAt. Lists additionally carry limit and nullable nextCursor. Lists never expose total counts. Search uses the exact list schema for its requested kind; meta.kind and every item.kind must match it, including when data is empty.

Default page size is 20, minimum 1, maximum 50. Order all kinds by updatedAt descending, then id descending. This is deterministic keyword discovery, not a relevance-quality promise. Do not imply semantic ranking or trending intelligence.

A nextCursor is opaque and integrity-protected, bound to API version, route, normalized filters, limit, last ordering tuple and expiry (ten minutes). No cursor contains private content, identity or credentials. Signature verification and expiry precede cursor use. Changing any bound input, tampering, malformed tokens or excessive size returns a safe 400. Distinguish INVALID_CURSOR from CURSOR_EXPIRED without echoing token contents. Rotate cursor signing material through a reviewed secret-management procedure at implementation time.

Each continuation still checks current eligibility. Do not revive withdrawn records by replaying a cursor. No snapshot or exactly-once pagination guarantee is made under concurrent edits; consumers deduplicate by (kind,id), tolerate missing/changed items and restart when a cursor expires. Omitting totals and expensive joins does not replace query-plan and load validation.

## Freshness, withdrawal and consumer retention

v1 uses Cache-Control: no-store on every success and error, with no ETag, 304, stale-while-revalidate or CDN success cache. Ignore conditional validators and return a newly evaluated 200/404/503. No successful stale fallback is allowed.

A controlled consumer may retain a card only in transient display memory under an application freshness lease: expiresAt must be no more than 60 seconds after checkedAt. no-store forbids HTTP caching; this narrowly specified display lease is not permission for an HTTP cache, durable mirror, search index, training corpus, offline copy or unrestricted republication.

The source sends an accurate Date header. The adapter checks checkedAt <= expiresAt, lease <= 60 seconds, plausible source time and response age; if source clock/age cannot be established, hide the content. Compute remaining lease conservatively using the response Date, Age if present, request/response timing and a monotonic local countdown. Never start a new full 60-second period on receipt or restart it when re-rendering/reloading an already held object. Delay can only reduce display time. An expired or inconsistent response is unusable even when HTTP status is 200.

Every displayed item has its own expiry. When a list refresh omits an item, remove it from that displayed result immediately. A failed page load cannot renew previously held cards. Refresh active views before expiry; hide expired cards on timeout, error or loss of connectivity. Pause/background handling must not allow an expired card to reappear on resume. Do not persist cards in browser local storage, a service worker cache or durable consumer storage.

A detail 404 removes the local card and resets any source-dependent presentation immediately. A 429/5xx/timeout is an unavailable state, not permission to extend stale content. List success may renew only included eligible items; it does not authorize a different held result or off-screen page. When a Space becomes private, its discussion/knowledge cards must disappear through the same source predicates and expiry rules.

The 60-second limit is a design target for cooperating, certified consumers, subject to measured clock/network behavior. It is not immediate revocation, proof of deletion from untrusted third parties or a guarantee that public content can never be copied. Faster push revocation and persistent change feeds require a separately reviewed later contract; webhooks are not implied by this draft.

## Limits, errors and outage behavior

Initial proposed per-consumer-network budgets are 120 combined reads/minute with a search subset of 20/minute, shared across instances; rejected search requests cannot bypass the combined budget through alternate routes. These are review defaults, not tested capacity. A global source concurrency/aggregate ceiling must also be selected from load evidence before activation; no safe value is established by this draft. The actual limiter uses only trusted deployment networking signals, bounded retention and protected quota keys. Do not trust arbitrary forwarded headers or send end-user IPs/identifiers from NexisHub. A server adapter's egress may share one budget across users; rollout must measure that and allocate a reviewed budget before traffic grows. Authentication or private-content rights are never a reward for a larger quota.

Proposed source request deadline is five seconds, with bounded database statements and a maximum 512 KiB uncompressed JSON response. Abort over-budget work safely; never return a partially successful search. Query-plan, limiter concurrency and response size tests are required before these defaults become release settings.

Errors use the documented code/message/requestId envelope only. Do not leak SQL, stack traces, tokens, raw query strings, hidden resource properties or per-user moderation status. Return Content-Type application/json, X-Content-Type-Options nosniff, X-Request-Id and Cache-Control no-store. 429 and 503 include a bounded Retry-After in seconds. Unavailable and internal-error messages are safe for users; detailed diagnostics stay in protected operational logs.

The adapter has an overall six-second page-fetch budget, aborts obsolete searches and handles only the latest response. At most one automatic retry is permitted for a transient network/503 failure, with jitter and remaining deadline. A 429 retry respects Retry-After and only happens within the caller's budget; otherwise show a retry action. Never retry 400/404/405 automatically. No retry can renew an expired card. Users see separate empty, unavailable and withdrawn states without fabricated content.

## Privacy, logging and client validation

Record bounded request ID, route template, status, duration and aggregate quota outcomes only. Do not put user identity, query text, cookies or untrusted full URLs into integration logs or AnalyticsEvent records. Operational retention must be set and tested before release. A display/read is not consent for cross-product profiling. No downstream advertising, AI ingestion or newsletter use is granted by this contract.

Validate response shape and content kind before rendering. Invalid payloads, unknown disallowed fields, unsafe URLs, incorrect timestamps or missing metadata fail closed. Do not use fallback raw Prisma/first-party payloads. Forward unknown error codes as a generic unavailable state while keeping requestId for support. Consumers should accept no less restrictive privacy rules when a source deployment changes.

## Versioning, tests and release gates

The v1 projection is deliberately fixed. Adding or changing exported fields, pagination semantics, eligibility, identity or retention requires contract review and consumer compatibility evidence. Incompatible changes require a new major path; no automatic promotion from draft 0.1.0 to a live v1 is allowed. Keep schema and examples synchronized. Source business models are not the integration contract.

The [acceptance matrix](pnyx-public-integration-v1-acceptance.md) defines required future executable evidence. This design's structural/schema checks are not those runtime checks. Before implementation, resolve source-lineage withdrawal semantics and approve measured quotas/clock handling. Before release, close the existing Milestone 6 gates, certify source and consumer commit/deployment identities, verify rollback and test privacy/withdrawal under real failures. Contract/consumer fixture tests can be prepared as part of an explicitly scoped future implementation batch.

Account linking, shared authentication, cross-product writes, webhooks, full content export, AI/advanced intelligence engines, reputation scoring, advertising and monetization remain outside v1 and gated. No NexisHub repository, app route, migration, environment, provider setting or deployment was modified to create this design.

## Design validation record

The [design validation record](pnyx-public-integration-v1-design-validation.json) reports seven GET operation declarations, 92 resolved internal references, 24 component schemas, ten passing synthetic examples and fourteen rejected negative schema examples. Local Markdown links and the documentation diff were checked. No full OpenAPI meta-schema linter or application/runtime suite was executed for this design-only change. The future acceptance matrix remains unexecuted.
