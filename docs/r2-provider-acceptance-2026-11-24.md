# Isolated R2 provider acceptance — 24 November 2026

Milestone 6A remains OPEN. All work is on audit/pnyx-remediation-20261025; no merge, deployment or production database operation was performed.

## Environment and first attempt

The owner configured a dedicated pnyx-e2e-media bucket and development delivery URL. Live GitHub UI confirmed the pnyx-r2-verification environment has exactly one allowed branch, audit/pnyx-remediation-20261025, zero allowed tags, and both expected secret names. No secret values were read.

[Run 45420907437](https://github.com/kellyxy110/Pnyx/actions/runs/45420907437), code/request commit 80bb751f6b36f484f7b887ec58c67c871592bc7e, failed: 27 HTTP checks passed, 90 browser checks passed, six media cases failed with a strict locator error at the removal status assertion. All six reached that assertion after successful real uploads, origin HEAD/no-store metadata, delivery no-store/WebP decode, reload persistence, replacement and prior-origin absence. This partial progress is not a passed media lifecycle.

The removal handler reused upload state and left the previous update message visible. The page temporarily had two status elements, including a misleading Uploading message. Cleanup reported no errors or retained-pointer failure. The failed assertion prevented final removal reload/absence checks from running.

## Correction

Removal has its own pending state, clears the prior success message and announces Removing avatar/banner. Profile controls stay disabled while either media action is pending. Success assertions target the profile success message. A held real DELETE request verifies the pending removal announcement, absence of stale success and disabled Save before releasing the request and checking actual provider/database results. It does not mock successful storage or deletion.

Local TypeScript, zero-warning lint, 136 unit tests and build passed for the application correction; the isolated CI attempts and final result are recorded below. Production custom-domain cache withdrawal, historical caches, durable cleanup reconciliation and account-deletion acceptance remain separate open requirements. A development r2.dev pass cannot certify production delivery.

## Second attempt

Corrected application commit 970251161c205057a99988380af2d86457ce47b8 passed native regression [45422822131](https://github.com/kellyxy110/Pnyx/actions/runs/45422822131): 136 units, 27 HTTP, 90 browser passes, six intentional storage-disabled skips, twelve migrations without drift, TypeScript/lint/build and zero vulnerabilities in both audits. Local checks also passed.

Provider run [45422821869](https://github.com/kellyxy110/Pnyx/actions/runs/45422821869) still failed all six media cases because the newly held request interceptor was removed before its continuation completed (Route is already handled). There were 90 browser and 27 HTTP passes, with no cleanup error. The harness is corrected to wait for actual removal success before unregistering the interceptor. No provider lifecycle pass is claimed for this attempt.

## Real provider lifecycle PASS

[Run 45424156617](https://github.com/kellyxy110/Pnyx/actions/runs/45424156617), job 138551561699, verified commit 8fc2829d4200a4a46807406bf4ab3262de2f48aa. All twelve migrations applied without drift, build passed, 27 native HTTP scenarios passed and all 96 browser cases passed with zero skips. This includes avatar and banner upload, origin/delivery metadata and decoding, reload, replacement, prior-origin absence, pending-removal feedback, removal and cleared-pointer/replacement-origin absence on mobile, tablet and desktop. Scoped fixture cleanup completed with no reported errors. No full-bucket inventory or production delivery purge was performed.

The same commit's storage-disabled native run 45424156410 passed TypeScript/lint/build, 136 units and both zero-vulnerability audits, but its first attempt had 89 browser passes, six intentional R2 skips and one desktop knowledge-editor network-failure feedback timeout. The same desktop case passed in the provider run and the preceding native run. Diagnostic attempt 2 of the failed job (138555761613) passed: twelve migrations without drift, 27 HTTP scenarios, 90 browser checks, six intentional storage-disabled skips, 136 units, TypeScript/lint/build and both zero-vulnerability audits. The original timeout remains an intermittent test issue with root cause unproven; a passing rerun does not establish a root-cause fix.

Provider execution is disabled again in the request file after this successful attempt. GitHub environment secret values were never read or included in evidence. Keep the dedicated credential expiry/revocation under owner control.

## Final recorded state

Code/test commit: 8fc2829d4200a4a46807406bf4ab3262de2f48aa. Application feedback correction: 970251161c205057a99988380af2d86457ce47b8. Native regression run 45424156410 attempt 2 is SUCCESS; real R2 run 45424156617 attempt 1 is SUCCESS. Disable-request commit 3aa051b passed run 45425599312, with its provider job skipped as intended. No further R2 writes were made by that disable check. The intermittent knowledge-editor timeout remains tracked, along with the separate release/cache/deletion gates.
