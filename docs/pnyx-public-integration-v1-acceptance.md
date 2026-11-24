# Public discovery v1 acceptance matrix — design only

Date: 24 November 2026. These are REQUIRED FUTURE TESTS, NOT PASSED RUNTIME RESULTS.

See the [contract](pnyx-public-integration-v1.md), [OpenAPI draft](pnyx-public-integration-v1.openapi.json) and [synthetic examples](pnyx-public-integration-v1.examples.json). Structural/schema validation of these documents is separate from executing an API or certifying NexisHub. No live endpoint or consumer implementation is created by this matrix.

## Execution identity

Future tests must record exact source/consumer commits, contract revision, fixture seed, app/database/storage targets, server clocks, cache settings and cleanup. Use synthetic users and a positively verified disposable environment; no canonical-hostname exclusion shortcut. Provider/Windows production access is not required for document validation. Native persistence, distributed quotas, network/browser and hosted acceptance each need their own evidence; mocks do not substitute for them.

## Required fixture matrix

Include anonymous caller, owner, follower, Space member, blocked user, suspended author, public-profile author and restricted-profile author. Seed public/private Spaces; public/private/follower/member posts; drafts; soft-deleted posts; all published knowledge statuses and DRAFT; artifacts with standalone/public/restricted/deleted post and reply sources. Include account-deletion cascades where the surviving artifact has a different owner. Any passed result must identify the fixture and exact route, not just count a successful HTTP status.

| ID | Scenario | Required result |
| --- | --- | --- |
| P01 | All seven GET operations on eligible fixtures | Exact response schema, content kind, permitted projection, canonical link and no-store headers. |
| P02 | Same request as anonymous, owner, follower/member and with arbitrary Cookie/Authorization | Same anonymous public eligibility and projection. No private/draft/viewer-state expansion or session cookie issuance. |
| P03 | Private, follower-only, member-only and draft content in a public Space | Absent from lists/search; details return the same 404 as a random unknown ID. |
| P04 | PUBLIC content inside a private Space | Absent everywhere regardless of caller membership/session. |
| P05 | Suspended/unavailable author | Content absent everywhere; no returned restricted author details. |
| P06 | Public content authored by a private/follower-only profile | Permitted public content may appear, with Community contributor / null username / null profile URL. Public-profile transition changes attribution only after re-evaluation. |
| P07 | Personal block/mute cookies | They neither grant extra access nor turn anonymous API behavior into a personalized integration. Check this limitation is clearly documented. |
| P08 | Public artifact with restricted/soft-deleted/draft post or reply source | Artifact excluded in list/detail/search; source contents, existence and counts are not disclosed. |
| P09 | Source post/reply hard deletion, account cascade and lost ON DELETE SET NULL references | Surviving dependent artifact does not silently become eligible as an apparently standalone item. Evidence must cover every destructive path and the chosen lineage/withdrawal strategy. |
| P10 | Genuine standalone public artifact | Remains eligible under the chosen strategy; no invented originDiscussionUrl. |
| P11 | Source/Space visibility changes during a paginated session | Current page and replayed cursor cannot return now-ineligible cards. |
| P12 | Unknown/private/draft/deleted/moderated IDs | Same status and safe error envelope; no hidden reason, titles, source metadata or stack traces. Do not promise elimination of every timing side channel without measurement. |
| S01 | limit absent, 1, 50, 0, 51, fractional and nonnumeric | Default 20; 1 and 50 accepted; invalid values safely rejected. No unbounded list. |
| S02 | Query lengths after trim, Unicode input, duplicate and unknown parameters | Exact declared bounds and one decode/normalization policy; duplicated/unknown inputs rejected. |
| S03 | %, _, quotes, SQL-like and regex-like search strings | Literal, safely parameterized matching; no wildcard amplification or code execution. |
| S04 | Search of each permitted kind, empty lists and space filter compatibility | Correct kind/schema; no profiles/replies/full bodies; kind=spaces plus space filter rejected. Unknown/private Space filter otherwise returns empty list. |
| S05 | Type/status filters on lists | Only permitted enums; privacy predicates apply before filtering/pagination. No private counts or filter hints. |
| S06 | Text and legacy fields, long Unicode, script-like and Markdown/code snippets | Bounded plain-text projection; literal snippets remain text; no active HTML, links, image loads or script execution. Missing historical publication date stays null. |
| S07 | User-controlled Host/forwarded Host, stored links, path injection | Every canonical/profile/origin link stays within the release-verified HTTPS Pnyx origin and approved resource paths. |
| C01 | First/next/final pages with tied updatedAt and concurrent edits | Deterministic tie-break, bounded page and final null cursor. Client deduplicates kind/id; no false snapshot/exactly-once guarantee. |
| C02 | Tampered, malformed, oversized or expired cursor | Safe 400; no token echo, raw decoder errors or resource/private hints. |
| C03 | Cursor used with changed route, kind, q, filters, limit or version | Rejected; a cursor is not a permission grant. |
| C04 | Cursor after content withdrawal | Recompute eligibility; no cached record resurrection. |
| F01 | Every success/error/HEAD response and attempted conditional request | no-store, no success CDN cache, no ETag/304, no Set-Cookie; validators cannot revive prior content. |
| F02 | checkedAt/expiresAt bounds and delay | Lease never exceeds 60 seconds from eligibility-read start; transport delay reduces usable time. Invalid, stale or uncertain clock data fails closed. |
| F03 | Deliberate source/adaptor clock skew, long query, slow delivery and 200 after expiry | Never reset a full lease on receipt; measure conservative remaining lease or hide. Record limits of the tested clock/network assumptions. |
| F04 | Consumer background/resume, re-render, reload, offline and service-worker interception | No expired card reappears; no durable/offline cache; monotonic expiry survives normal UI state transitions. |
| F05 | 404 for an already displayed card | Remove immediately, clear dependent presentation and retain no public cache copy. |
| F06 | Refresh omits a former item, changes page or returns an empty list | Remove omitted items for that result; do not renew off-screen/unreturned cards. |
| F07 | 429/500/503/timeout during refresh | Show unavailable/retry state; previous cards expire on schedule. No stale success or fabricated empty result. |
| F08 | Source made private/deleted during active display | Cooperating consumer withdrawal meets the measured lease target; explicitly record non-immediate revocation and external-copy limitations. |
| R01 | Database/replica/eligibility lookup failure | Safe 503, not 404/empty 200/stale fallback. No partial search success. |
| R02 | Concurrent quota use across application instances and routes | Proposed combined 120/min and search subset 20/min enforced atomically at the agreed deployment scope. Search cannot bypass combined quota. No arbitrary forwarded-header override. |
| R03 | Oversized response, expensive query, cancelled request | Enforced five-second source budget and 512 KiB response cap; aborted DB work bounded; safe failure without partial payload. |
| R04 | Consumer retries and obsolete searches | At most one permitted automatic retry, bounded jitter/Retry-After and six-second overall budget. Abort obsolete work; old responses cannot replace newer query results. |
| R05 | POST/PUT/PATCH/DELETE against each proposed path | 405 with Allow; no invocation of existing domain write handlers, notifications, AI or user analytics. HEAD/OPTIONS remain side-effect-free apart from reviewed operational counters. |
| R06 | Inbound sessions, Telegram identities, query text and network headers | No forwarding, cross-product identity mapping or sensitive request logging. Quota diagnostics have reviewed retention and no user-engagement events. |
| R07 | Source response with extra fields, incorrect kind, unsafe origin or invalid lease | Adapter rejects it; never falls back to raw first-party response. |
| R08 | Operational enable/disable, rollback and version mismatch | Fail safely without broadening permissions or retention. Rollback must disable consumers rather than restore a known unsafe source implementation. |

## Human/product acceptance

- Existing NexisHub navigation receives only the reviewed discovery surface; no unsolicited new navigation module is assumed.
- Source attribution, excerpt-only behavior and Read on Pnyx links are clear and accessible.
- Empty, unavailable, withdrawn and retry states have keyboard/focus and status-announcement behavior.
- Real Telegram/mobile host certification remains separate if that consumer surface is later selected; no iframe/header weakening is implied.
- Publication/redistribution, retention, moderation ownership and support contacts have an explicit product decision before consumer activation.
- Measured source capacity determines final budgets; provisional contract numbers are not benchmark results.

## Acceptance record required before activation

Record matrix IDs passed/failed/not applicable with reasons, test outputs, data cleanup, both deployed identities, monitored withdrawal latency, quota behavior, incident owner and rollback. Gate on the existing Milestone 6 requirements. A syntactically valid OpenAPI file, a synthetic example, a mocked adapter or an HTTP 200 alone cannot close this acceptance gate.
