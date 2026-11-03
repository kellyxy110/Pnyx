# End-to-end and profile corrections — 3 November 2026

Scope: `audit/pnyx-remediation-20261025`, following the Phase 1–10 reconciliation and search/visual review. This review uses synthetic accounts and disposable local storage; it does not inspect or modify a real user's personal records. No production database migrations, fixture writes, merge, or production configuration changes are part of verification.

## Verified gaps and corrections

| Journey | Observed gap | Correction |
| --- | --- | --- |
| Public profile | Private discussion titles, unpublished knowledge, and private Space memberships could appear in public activity. | Filter public activity and counts; honor profile visibility, suspension, and blocks on profiles and network lists. |
| Content access | Direct API/HTML, replies, related content, discovery, and action routes applied inconsistent visibility checks. | Share typed read policies across these paths, including private Spaces and restricted source material. |
| Knowledge reuse | Arbitrary or mismatched source replies could be attached; reusing restricted content could broaden its audience. | Check source ownership boundaries and matching parent; inherit private visibility for restricted sources; filter legacy unsafe references. Save initial revision atomically with artifact. |
| Profile editing | Failed requests could leave controls busy; username checks could become stale; additional links were omitted from display. | Retain edits, release controls, support cancel/retry, cancel obsolete username checks, refresh navigation identity, and display validated links. |
| Profile media | Ordinary profile updates could replace managed avatar URLs; concurrent pointer swaps could orphan objects; remote images could fail Next's optimizer configuration. | Dedicated managed-media updates, serialized database pointer swaps, compensating upload cleanup, decoded raster validation, and direct image rendering. Keep object keys when removal cannot run. |
| Author drafts | Profile draft links opened a detail page instead of resuming writing; request failures could strand composer controls. | Open the composer with the owned draft, preserve writing on failure, release controls, and prevent repeated failed autosaves. |
| Knowledge editor/browser | Network failures and unavailable AI could produce stuck controls or misleading success; old list responses could replace current filters. | Recover request state, preserve text, report AI availability truthfully, abort stale list requests, and retain submitted pagination criteria. |
| Search | Reply author/date filters described the parent discussion; malformed dates/pages could reach queries. | Filter the reply itself and validate all submitted list/search criteria. |
| Social actions | Duplicate follows could race, notification links pointed at the wrong profile, and blocking retained follow edges. | Idempotent follows, actor links, and transactional block/follow removal. |
| Deployment | Vercel build automatically ran database migrations. | Build generates Prisma and Next output only. Migrations remain a separate explicit operation. |

## Verification

The adjacent JSON file records 88 passing unit tests, 18 passing API scenarios, 90 passing browser checks, three isolated-R2 skips, 77 passing responsive combinations, TypeScript/lint success, and passing security-header checks. The final production build passes after the development dependency update. Native CI status is updated with release evidence. The PostgreSQL-compatible local run uses PGlite with the actual migration SQL and Prisma HTTP requests; it is not represented as native PostgreSQL evidence. The existing GitHub Actions native PostgreSQL 16 workflow remains the native release gate.

Three live R2 browser scenarios remain intentionally skipped without an isolated object-storage provider. Media route tests use real Sharp decoding with mocked object storage; database pointer concurrency is exercised separately. Provider-backed upload/removal and durable cleanup retries still require isolated storage acceptance. Prior screenshot review is documented in `uiux-visual-review-2026-10-30.md`; automated checks here do not claim a new manual screenshot or screen-reader review.

## Dependency security update

A fresh 3 November scan found GHSA-g3hv-75wg-m249. The affected `typescript-estree` dependency was updated from minimatch 10.2.6 to 11.0.1 with a scoped override; lint, TypeScript and 88 unit tests passed afterward. Production audit reports zero vulnerabilities. The full audit still reports 13 moderate development-tool findings propagated from minimatch 3.1.5. Its installed source has none of `firstPhasePreProcess`, `secondPhasePreProcess`, or `optimizationLevel`; the described exploit is therefore not present in that code path, but the advisory database still marks every version below 11.0.1. This is an applicability assessment, not an upstream exemption or a clean full audit. A global minimatch override would break older callers that require the function export.

Sources: [maintainer advisory](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249), [database advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249), [upstream applicability question](https://github.com/github/advisory-database/issues/10811). CI now blocks all production advisories and high/critical development advisories; moderate development reports remain visible. No production package was changed by this update.

## Deployment

The user authorized commit and deployment for this release. Deployment must reference the verified remediation commit and existing Pnyx Vercel project. Team-scoped project access currently returns not-found/forbidden despite project discovery; consent is required before deployment can be attempted. No deployment is claimed until Vercel returns a ready deployment and its URL is checked.
