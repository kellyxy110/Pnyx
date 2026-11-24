# Isolated authenticated and R2 verification

Updated: 24 November 2026. Applies only to disposable local Pnyx verification. Hosted Preview and production targets are deliberately rejected by this runner; their acceptance needs a separate reviewed target mechanism.

## Positive target contract

- PNYX_DISPOSABLE_POSTGRES must be 1. Database must use a PostgreSQL URL on literal loopback/localhost with a pnyx_verify_ prefixed database name. Only public schema and bounded connection_limit are permitted for native verification; duplicate/redirecting connection options are rejected.
- APP_URL and PLAYWRIGHT_BASE_URL must resolve to the same explicit HTTP loopback origin, with no credentials, query or path. A different production alias is rejected, not merely the known production hostname.
- Authenticated browser tests require E2E_ALLOW_AUTHENTICATED=true, a dedicated synthetic .test/.invalid email, password of at least 12 characters and a fresh 64-character hexadecimal PNYX_VERIFICATION_SECRET shared only by this run's server and tests.
- The health endpoint answers a fresh random nonce with an HMAC only when its process has valid opted-in disposable configuration and a healthy DB. The proof binds runtime app/database configuration, fixture email, storage target/credentials and per-run secret. Tests reject mismatches or redirects before fixture writes or credential entry. No configuration, secret or identity is returned in the health body. Normal/Vercel deployments produce no proof.
- This is a guard against accidentally targeting another process/configuration. It is not remote attestation, a substitute for reviewing local port forwards/poolers or proof that an operator's claimed test bucket is administratively isolated.
- Fixture suites run serially. Authenticated traces/screenshots are disabled by default. Do not publish environment files, credentials, proof secrets or credential-bearing diagnostics.

The native verifier generates its secret/password/account afresh and passes the same environment to Next and Playwright. It disables email, OAuth and AI providers. Ordinary browser verification explicitly disables R2. The separate PGlite compatibility path is labelled, opted in and restricted to pnyx_verify_ui with exact pooler compatibility options; it is not native PostgreSQL evidence.

## Reproducible native commands

Start a disposable PostgreSQL 16 database on loopback with a name such as pnyx_verify_ci. Configure DATABASE_URL and APP_URL privately in the runner environment and set PNYX_DISPOSABLE_POSTGRES=1. Select an unused local app port. Never substitute a production connection string or production proxy, and do not point any test env at hosted production aliases.

Install the repository's locked dependencies and generate Prisma before verification. Install the locked Playwright browser using the existing package executable; an explicitly reviewed PLAYWRIGHT_EXECUTABLE_PATH can select an already installed compatible browser.

- npm run verify:postgres — native migration replay/status/drift/build and 40 HTTP/database scenarios. No R2.
- npm run verify:browser — those same native checks followed by all public/authenticated browser scenarios using a newly seeded synthetic account. R2 remains disabled and its 12 browser cases are skipped.
- npm run verify:media — the native and browser flow with explicitly opted-in dedicated R2 configuration below. Missing/contradictory configuration fails preflight before migration/fixtures. This command is not authorized for production.

The browser runner creates a disposable identity only after the native HTTP suite, then cleans that identity after browser execution. If media pointers remain, it retains the fixture account/pointers for isolated reconciliation rather than discarding the object provenance. Resolve any retained keys before disposing of that disposable database. Resource cleanup and provider errors are failures, not successful acceptance.

The GitHub native PostgreSQL workflow runs verify:browser with external providers disabled. The job's tests, migrations and browser artifacts are synthetic; no real R2 upload is claimed by that CI run.

## Dedicated R2 prerequisites

Provision/review a bucket dedicated solely to these tests, with a name beginning pnyx-e2e-. Confirm it is not used by live users. Configure bucket-scoped object read/write/delete and the permissions necessary to verify absence; a 403 is not treated as evidence of deletion. Confirm the delivery base serves this test bucket, never a production media domain. Do not paste keys into chat or commit them.

Configure all five normal R2 values privately in the isolated environment:

- R2_ENDPOINT — reviewed HTTPS account endpoint under r2.cloudflarestorage.com.
- R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY — scoped test credentials.
- R2_BUCKET_NAME — dedicated pnyx-e2e- bucket.
- R2_PUBLIC_BASE_URL — reviewed HTTPS delivery base, without credentials/query/fragment.

Also explicitly set E2E_STORAGE_ENABLED=true and three non-secret expected target declarations:

- E2E_STORAGE_ENDPOINT — exact endpoint origin.
- E2E_STORAGE_BUCKET — exact dedicated bucket name.
- E2E_STORAGE_PUBLIC_BASE_URL — exact normalized delivery base without trailing slash.

Both actual provider settings and expected declarations must agree; the live app's challenge must bind those same values. Bucket naming/declarations do not replace provider ownership/policy review. The runner creates no bucket, token, delivery domain or billable provider resource.

## Verified cleanup recovery

Current source `8519976` replays 14 migrations without drift and passes 146 unit tests, 40 HTTP/database scenarios and all 102 provider-enabled browser cases. See [upload reservation evidence](upload-reservations-2026-11-24.md) and [earlier durable cleanup evidence](media-cleanup-2026-11-24.md). The provider-disabled run passes 90 browser cases with 12 intentional skips.

`npm run media:cleanup` requires the same opted-in disposable database and matching dedicated storage declarations. It processes at most 25 due receipts, prints counts only, and exits nonzero if receipts remain. Retry after the recorded backoff when recovering an isolated failure. The media runner invokes it before fixture disposal. No production worker or schedule is enabled.

Pre-upload reservations are protected for 15 minutes, consumed only with successful profile-pointer adoption, and retained after interrupted uploads. Expired abandoned reservations remain as tombstones after successful provider deletion and are due for another sweep after 24 hours; provider failures retain existing bounded backoff. A retained tombstone keeps command status nonzero even if its object is absent. Application recovery never auto-retires these tombstones. Operational retention and production scheduling/alerting remain open. The real-provider suite explicitly removes only its own synthetic reservation fixture receipts at teardown; that is not production retention policy.

## Prepared provider acceptance

For each avatar and banner, on mobile/tablet/desktop, the prepared suite:

1. Refuses a fixture that already has media of that kind.
2. Generates a synthetic raster and uploads through the real UI.
3. Reads persisted metadata and verifies the object at the R2 origin and delivery URL, including no-store metadata/response policy, no cached-hit/stale response and actual WebP decoding/dimensions.
4. Reloads and verifies the same pointer.
5. Replaces with a different image, verifies the new pointer and old-origin absence.
6. Removes through the UI, reloads, checks the cleared pointer and replacement-origin absence.
7. Cleans only keys under that fixture user's media-kind prefix, retaining provenance on failure.

The first passing provider lifecycle run is 45424156617 on 24 November 2026, with all six media cases executed; see r2-provider-acceptance-2026-11-24.md. Six skips in a storage-disabled run are not provider evidence. The route unit tests separately exercise real Sharp decoding with mocked storage/pointer failures.

The earlier account-deletion provider run is 45428918042: all nine R2 cases include the six image lifecycles plus three disposable-account deletion cases. Account deletion uploads both images, verifies deletion/session revocation, confirms both origin and development delivery URLs absent and checks no account-scoped receipts remain. Native tests separately inject provider failure to verify durable retry, backoff, transaction rollback, reference protection, target matching and concurrent-worker exclusion.

New uploads request Cache-Control: no-store. This corrects the prior year-long immutable policy; it does not rewrite historical object metadata, purge existing caches or override provider delivery rules. Origin HEAD absence is not proof that a previously cached public delivery URL is purged. Delivery-cache withdrawal/purge policy needs explicit provider acceptance before 6A media sign-off. Durable retries for saved pointers and isolated account-deletion assets are verified. Pre-upload reservations and repeated abandoned-upload sweeps now pass in run 45432893170 (12 R2 cases, 102 total browser cases). Production scheduling/alerting, abandoned-record retention, inventory reconciliation for earlier uploads and production-adjacent acceptance remain open. Do not convert these origin tests into a claim of complete deletion propagation or completed 6A.
