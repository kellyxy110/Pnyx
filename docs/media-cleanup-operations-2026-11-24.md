# Media cleanup operations preparation — 24 November 2026

Branch: audit/pnyx-remediation-20261025. Milestone 6A OPEN; 6B/6C PAUSED. This batch prepares and verifies operations. It does not activate a production schedule, external alert destination, migration, deployment or cache purge.

## Scheduled worker and monitoring contract

The GET/POST /api/internal/media-cleanup handler is disabled unless MEDIA_CLEANUP_ENABLED=true. It requires an Authorization Bearer credential matching CRON_SECRET (at least 32 characters). MEDIA_CLEANUP_ENDPOINT and MEDIA_CLEANUP_BUCKET must exactly match complete runtime R2 configuration. Missing authorization returns 401; disabled returns 404; missing/contradictory configuration returns 503 before database/provider work. Responses are no-store and contain counts only, never object keys or credentials. Do not use browser sessions or query-string secrets to invoke it.

The bounded worker selects at most five eligible exact-target receipts. A durable database lease prevents overlap for five minutes and renews before each item. A displaced owner stops and cannot overwrite its successor's heartbeat. Per-receipt row locking, pointer protection, target checking and retries remain active. The handler has a 60-second execution budget; each underlying provider delete has a three-second abort and receipt transaction a ten-second limit. Execution after process death resumes after lease expiry, subject to the next scheduler invocation. Actual platform timeout/plan and throughput acceptance remain required before activation.

The protected GET /api/internal/media-cleanup/status endpoint checks the last completion and current backlog. An absent/completion heartbeat older than 15 minutes, prior failed/attention batch, persisted provider/config/reference failure, foreign-target receipt, due item overdue by 15 minutes or retention review requirement produces attention and HTTP 503. Batches report overlap as 409, actionable failure as 503, healthy completion as 200. Normal retained upload tombstones do not by themselves mean provider failure. Status reads do not execute cleanup.

Attention reports and worker errors produce sanitized structured console errors. The worker persists its latest safe summary and heartbeat. No email, Slack, webhook or paid monitoring service is called. An external monitor must poll the protected status endpoint and route log/HTTP alerts before production acceptance; that delivery is not certified here. Database failure returns sanitized 503, and a missed heartbeat remains detectable even if a process dies before logging.

The inert example [schedule configuration](media-cleanup-schedule.example.json) proposes a five-minute cadence. It is outside active vercel.json. Review the actual hosting plan, scheduler API, timeouts, capacity and monitoring receiver before copying any configuration into deployment. The example uses legacy Vercel Cron; its documented Hobby once-daily limit does not support this cadence. No plan change or purchase is made. Vercel cron authorization is documented at https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs. No retry/delivery guarantee from a scheduler replaces the database receipts.

## Retention policy

Ordinary deletion receipts retire after successful deletion. Abandoned upload reservations remain indefinitely while provider late-write uncertainty exists, with repeated sweeps every 24 hours after a successful delete. Failures use existing bounded backoff. At 30 days of reservation age, reviewRequired becomes an actionable alert; it never triggers record or object deletion by age. Live upload leases stay protected. Clock synchronization and database durability/backups are operational prerequisites.

Retirement of an abandoned record requires a separately reviewed record of provider-write fencing, origin/delivery absence, target/key ownership and no current references. There is deliberately no automatic age-based purge or retirement endpoint. No production retention exception has been exercised. Indefinite provenance plus mandatory review is the current safe policy; a finite retention period requires stronger write-finality evidence.

## Older untracked uploads: read-only reconciliation

npm run media:inventory requires the existing opted-in disposable loopback database and matching dedicated pnyx-e2e storage target; it rejects arguments and cannot target hosted production. It lists at most ten pages/10,000 objects with bounded requests and refuses a partial scan. References and exact-target receipts are loaded after listing. Current pointers are protected, receipts are tracked, recent untracked managed keys are protected for seven days, older managed untracked keys are review candidates, and unmanaged/missing-date keys remain unknown. All profile pointers, including non-public profiles, participate.

The non-atomic snapshot is never deletion authority. It writes a private ignored artifacts/media-inventory-private.json with timestamp and classifications, prints counts only and never invokes provider deletion. A future production inventory must use an explicitly approved read-only target and consistent database/provider snapshots, then reconcile each candidate against current references, reservations and ownership. Existing historical uploads are not retroactively certified by synthetic fixtures. Never turn a candidate list, incomplete listing or age cutoff into bucket-wide cleanup.

## Production cache withdrawal acceptance

R2 development delivery is verified separately from production custom-domain caching. Cloudflare documents custom-domain caching and the non-production r2.dev boundary at https://developers.cloudflare.com/r2/buckets/public-buckets/.

Before production acceptance, identify the actual media hostname, bucket, every public alias and applicable cache rules. Use an isolated non-user-owned synthetic object served through the intended policy. Verify WebP/no-store metadata and decoding, request it before deletion, remove it, prove origin absence, then check each delivery alias from independent clients. Include any legacy immutable metadata/cache rules and an approved exact-URL purge path where required. Record status, headers, timestamps, TTL/purge limits and stale behavior. A local browser reload or origin-only 404 does not prove CDN withdrawal. This batch changes no DNS, bucket access, metadata or cache rules and executes no production purge.

## Windows and release reconciliation

Read-only Vercel inspection on 24 November returned no Pnyx projects in the default scope or the visible Kellyxy's projects team. Deployment lookup for pnyx-psi.vercel.app returned 404. These are connection/scope observations, not proof the live application is absent. The current deployed SHA remains unverified. A dashboard fallback reached the Vercel login page; no sign-in method or credential was submitted. The page was preserved for the access step. No secret values were retrieved or deployment attempted.

The selected workspace is Linux; C:\Users\user\Desktop\Pnyx was not accessed. Follow the preservation-first [Windows recovery sequence](pnyx-roadmap-reconciliation-2026-11-24.md) before repairing permissions/index. Preserve tracked, untracked and staged work and metadata; compare a healthy sibling clone at the exact remediation SHA. Do not reset, bulk-stage, push main or discard loose work. Windows reconciliation cannot be certified without that machine's preserved inventory and diffs.

Release remains gated on the Windows evidence, correct Vercel project/team access, exact source/alias identity, migration review, rollback plan and separately scoped production-adjacent acceptance. The existing isolated runner rejects production/hosted aliases; do not weaken its guards. Do not activate cleanup until the verified release and monitoring target are established.

## Verification

Verified source: `afafb69017fd38040af3de007cd9fd91ce6ae01c`.

- [Native CI 45437762282](https://github.com/kellyxy110/Pnyx/actions/runs/45437762282) passed first attempt: TypeScript, zero-warning lint, 162 unit tests across 27 files, build, 50 HTTP/database scenarios and 90 browser checks; 12 real R2 cases intentionally skipped. Full and production audits each reported zero vulnerabilities.
- [Provider CI 45437763132](https://github.com/kellyxy110/Pnyx/actions/runs/45437763132) passed first attempt: 50 HTTP/database scenarios and all 102 browser cases, including 12 real R2 cases. The existing repeated-write recovery case now invokes the bounded worker for both sweeps and passes on mobile/tablet/desktop.
- Both runs replayed all 15 migrations without drift. The new table was created only in disposable CI.
- Final isolated recovery counts were attempted=0, completed=0, pending=0. The subsequent complete dedicated-bucket inventory found objects=0, referenced=0, tracked=0, recent=0, review=0, unknown=0 and deletionAuthorized=false. This is test-bucket evidence, not production historical reconciliation.
- Native tests cover idle heartbeat, retained provider failure/alerts, bounded draining, concurrent invocation exclusion, expired-process recovery/stale heartbeat, retention review, live upload protection, wrong-target detection, displaced-owner fencing and disabled HTTP routes. Unit tests cover authorization/configuration, HTTP outcomes, sanitized errors and inventory classification.
- Local security configuration passed 5/5, runtime headers passed on loopback, and disabled cleanup/status routes returned no-store 404. Local TypeScript/lint, 162 units and build passed during implementation.

The schedule definition was validated as inert JSON outside vercel.json. No hosted scheduler delivered a run; no external alert receiver was tested. Those operational activation checks remain open. The provider request is disabled again in the evidence commit. No merge, deployment, production migration or production cache change occurred. [Machine-readable results](media-cleanup-operations-2026-11-24-results.json).
