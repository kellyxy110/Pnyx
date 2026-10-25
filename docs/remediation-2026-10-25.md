# Pnyx remediation reconciliation, 25 October 2026

Repository: `kellyxy110/Pnyx`

Branch: `audit/pnyx-remediation-20261025`

Starting commit: `f7305ab0a825f565bde16d7d41d46639b904fd35`

## Source and preservation

A complete working checkout with 105 ancestor commits was retrieved from GitHub. The requested branch started clean at the same commit as `main`. `git fsck --full` passed. No other branch was checked out or modified. No existing local user work was present in this new checkout.

All ten original ZIP packages were retrieved and inspected. Their SHA-256 hashes and sizes are recorded in `remediation-2026-10-25-packages.json`. The original archives remain unchanged.

## Package reconciliation

| Phase | Original contribution | Resolution against the complete checkout |
| --- | --- | --- |
| 1 | Membership DELETE correction; eight isolated mocked tests | Applied the checked patch. DELETE now reads persisted membership and count rather than claiming every Leave removed membership. Extended the existing repository tests instead of replacing them. |
| 2 | Deleted-account token proposal and diagnostic tests | Superseded its incomplete fresh-user fallback by the stronger Phase 3/9 rule. A successful lookup returning no account clears `token.userId`. |
| 3 | Repository-native auth and membership regressions | Added identity lifecycle tests and incorporated the moderator response assertion into the existing membership suite. Preserved existing coverage. |
| 4 | Mobile CSS and expanded viewport audit | Integrated the candidate CSS and expanded the existing responsive script to 11 widths, seven routes, navigation bounds, and minimum navigation-link widths. |
| 5 | Space browser parent-state proposal | Reconstructed valid changes using Phase 7. Successful server responses update parent Joined/Following data and authoritative counts. |
| 6 | Integration review and malformed-patch warning | Honored the warning: did not apply malformed auth/Space patches directly. |
| 7 | Fail-closed patch generator | Generated a valid diff against the exact source, checked with `git apply --check`, then applied it. Preserved Join-only navigation so a protected moderator Leave does not navigate away. |
| 8 | Combined staging installer and copied tests | Dry run correctly refused to overwrite the existing membership test file. Integrated the intended changes individually instead of weakening its preflight or overwriting tests. |
| 9 | Isolated deleted-account resolver tests | Reconciled into real module tests; preserved suspension handling, normalized lookup, and existing transient-error behavior. Reviewed OAuth provisioning: `ensureOAuthUser` creates/resolves the local account before JWT resolution. |
| 10 | Synthetic staging verification | Treated fixture results as historical evidence only. Replaced its unexecuted full-checkout gates with actual repository checks below. |

## Additional corrections required by verification

- Repaired missing optional platform dependencies in the npm lockfile so a clean install can succeed.
- Replaced `next lint` with ESLint's supported CLI. Ignored generated build/browser output and removed anonymous-default-export warnings.
- Applied compatible dependency security updates. Upgraded Vitest to 4.1.12 and corrected the Resend constructor mock for its stricter constructor behavior. Renamed the Vitest config to `.mts` for explicit ESM loading.
- Scoped a `deepmerge-ts` 8.0.2 override to `@prisma/config`, retaining Prisma 6.19.3 and the existing schema. Prisma generation, validation, and the application build verify this configuration path.
- Changed browser, responsive, and security-header defaults to `http://127.0.0.1:3000`. Authenticated tests still require explicit opt-in and dedicated credentials.
- Corrected authenticated browser selectors to match the exact password input and the current profile heading/menu markup. Public-route checks now reject HTTP 4xx responses too.
- Disabled Vercel Git deployments for this exact remediation branch in `vercel.json`, preserving the existing build command. The repository contains no GitHub Actions deployment workflow. No deployment command was run.

## Executed checks

The results below are from executed full-checkout checks. Earlier failures were corrected and rerun; their causes are described below. A machine-readable summary is in `remediation-2026-10-25-results.json`.

| Gate | Result |
| --- | --- |
| Clean dependency installation | PASS after lockfile repair; final run used `npm ci --no-audit --no-fund` with lifecycle scripts enabled |
| TypeScript | PASS, `npm run typecheck` |
| ESLint | PASS, `npm run lint -- --max-warnings=0` |
| Vitest | PASS, 16 files, 64 tests |
| Prisma generate and schema validation | PASS; no migration command executed |
| Production-mode application build | PASS, `npm run build`, 38 pages generated |
| npm dependency audit | PASS, zero known vulnerabilities after remediation |
| Security headers | PASS, five static configuration checks and five actual localhost HTTP headers |
| Credential-pattern scan | PASS, no matches for high-confidence private-key, GitHub token, AWS access-key, or live Stripe-key patterns in tracked source; not a full historical secret audit |
| Responsive geometry | PASS, 77/77 route/viewport combinations |
| Playwright | PASS, 51 passed, zero failed, three isolated-storage tests skipped; mobile, tablet, and desktop Chromium projects |
| Git whitespace/integrity | PASS, `git diff --check` and `git fsck --full` |

## Browser and database environment

Checks run against the local production-mode Next.js app. The isolated database is an in-memory PGlite instance initialized from SQL generated from the repository's schema, exposed through the official `@electric-sql/pglite-socket` adapter. It contains only a synthetic QA user and a synthetic Web3 Space. Credentials and database objects are local fixtures, not production values. No mail, OAuth provider, AI provider, or object-storage integration was enabled.

The standard Playwright browser download returned invalid archives in this environment. A separate scratch-only `@sparticuz/chromium` runtime supplied Chromium 153.0.8010.0 through `PLAYWRIGHT_EXECUTABLE_PATH`. Desktop, tablet, and mobile projects all use Chromium; this is not Safari/WebKit or real-device evidence.

The first fixture server wrapper closed Prisma connections; it was replaced before the verified browser reruns. An initial Playwright invocation also ran in a separate network namespace from its server and received connection refusals. A subsequent build-and-browser run exposed prepared-statement name collisions in the multiplexed PGlite fixture. The final fixture connection used `connection_limit=1&pgbouncer=true&statement_cache_size=0`; production application connection settings were not changed. Final verification starts the database, application, and tests together in one process environment.

Authenticated journeys verify sign-in/session navigation, profile save and reload, composer access, Space context, and persisted Join/Leave across reloads in all three projects. Twelve additional browser tests use intercepted Space API responses to verify filter updates, authoritative counts, protected moderator membership, failed actions, and reload behavior. The remaining 24 browser checks cover public-route accessibility, overflow, keyboard focus, and reduced motion. All ten original ZIP archives passed integrity checks. The original Phase 3 and Phase 5 proposal patches were independently confirmed corrupt (`git apply --stat` failed at lines 11 and 7 respectively).

## Verification boundaries

- Membership unit tests mock Prisma. PGlite browser journeys exercise application persistence but do not establish native PostgreSQL concurrent-transaction behavior or production connection-pool behavior. No production or staging database was accessed, migrated, or seeded.
- Space response synchronization is verified within the current browser list. Cross-tab live refresh and reconciliation of arbitrary later hook-prop changes remain outside this change; no universal race-safety claim is made.
- Database outages retain the existing session fallback behavior. Missing-email tokens retain existing behavior. The correction specifically revokes identity when a successful lookup confirms absence.
- Isolated R2 upload/removal tests require dedicated storage configuration and remain skipped when it is absent. No external storage was changed.
- Dependency audit results describe known registry advisories at the time of execution, not a guarantee that the application has no vulnerabilities.
- No merge, deployment, production data mutation, or unrelated-work replacement was performed.

## Reproduction

Use a dedicated local database initialized from `prisma/schema.foundation.prisma`. Do not use production environment files. Set `DATABASE_URL`, a local-only `AUTH_SECRET`, and `APP_URL=http://127.0.0.1:3000`; then run:

```sh
npm ci
npm run db:generate
npm run db:validate
npm run typecheck
npm run lint -- --max-warnings=0
npm test
npm audit
npm run build
npm start -- --hostname 127.0.0.1
```

With that local app running, run `npm run audit:security`, `npm run audit:responsive`, and `npm run test:e2e -- --workers=1`. Authenticated journeys additionally require `E2E_ALLOW_AUTHENTICATED=true`, `E2E_EMAIL`, and `E2E_PASSWORD` for an account created in the isolated database; the Web3 journey expects a public Space with slug `web`. Supply `PLAYWRIGHT_EXECUTABLE_PATH` only when using a separately installed Chromium binary.

Vercel's branch deployment control is documented at <https://vercel.com/docs/project-configuration/git-configuration>. The deepmerge fix is documented at <https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx>. Fixture limitations are documented at <https://pglite.dev/docs/pglite-socket>.
