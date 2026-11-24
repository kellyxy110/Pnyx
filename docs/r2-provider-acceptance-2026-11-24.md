# Isolated R2 provider acceptance — 24 November 2026

Milestone 6A remains OPEN. All work is on audit/pnyx-remediation-20261025; no merge, deployment or production database operation was performed.

## Environment and first attempt

The owner configured a dedicated pnyx-e2e-media bucket and development delivery URL. Live GitHub UI confirmed the pnyx-r2-verification environment has exactly one allowed branch, audit/pnyx-remediation-20261025, zero allowed tags, and both expected secret names. No secret values were read.

[Run 45420907437](https://github.com/kellyxy110/Pnyx/actions/runs/45420907437), code/request commit 80bb751f6b36f484f7b887ec58c67c871592bc7e, failed: 27 HTTP checks passed, 90 browser checks passed, six media cases failed with a strict locator error at the removal status assertion. All six reached that assertion after successful real uploads, origin HEAD/no-store metadata, delivery no-store/WebP decode, reload persistence, replacement and prior-origin absence. This partial progress is not a passed media lifecycle.

The removal handler reused upload state and left the previous update message visible. The page temporarily had two status elements, including a misleading Uploading message. Cleanup reported no errors or retained-pointer failure. The failed assertion prevented final removal reload/absence checks from running.

## Correction

Removal has its own pending state, clears the prior success message and announces Removing avatar/banner. Profile controls stay disabled while either media action is pending. Success assertions target the profile success message. A held real DELETE request verifies the pending removal announcement, absence of stale success and disabled Save before releasing the request and checking actual provider/database results. It does not mock successful storage or deletion.

The corrected candidate is being verified locally and in a fresh isolated CI attempt; final run evidence follows after completion. Production custom-domain cache withdrawal, historical caches, durable cleanup reconciliation and account-deletion acceptance remain separate open requirements. A development r2.dev pass cannot certify production delivery.

## Second attempt

Corrected application commit 970251161c205057a99988380af2d86457ce47b8 passed native regression [45422822131](https://github.com/kellyxy110/Pnyx/actions/runs/45422822131): 136 units, 27 HTTP, 90 browser passes, six intentional storage-disabled skips, twelve migrations without drift, TypeScript/lint/build and zero vulnerabilities in both audits. Local checks also passed.

Provider run [45422821869](https://github.com/kellyxy110/Pnyx/actions/runs/45422821869) still failed all six media cases because the newly held request interceptor was removed before its continuation completed (Route is already handled). There were 90 browser and 27 HTTP passes, with no cleanup error. The harness is corrected to wait for actual removal success before unregistering the interceptor. No provider lifecycle pass is claimed for this attempt.
