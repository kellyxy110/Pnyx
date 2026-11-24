# Milestone 6A test isolation and media preparation — 24 November 2026

Base: 26923ee on audit/pnyx-remediation-20261025. This is the next core-readiness batch, not implementation of the proposed integration API. 6A remains open; 6B/6C and later product capabilities remain gated.

## Implemented

- Replaced the canonical-production-host exclusion and separate browser loopback check with one positive disposable target contract. Native database URLs must use loopback, a pnyx_verify_ database, permitted connection options and explicit opt-in. Duplicate options, redirection, ordinary/remote databases, Vercel markers and contradictory app/browser origins are rejected.
- Authenticated suites require a dedicated synthetic account, generated per-run secret and a nonce-bound proof from the running app before credential entry or fixture writes. The proof binds app/database runtime configuration, fixture identity and storage configuration. Healthy but mismatched processes are rejected. Proof is absent from ordinary/Vercel deployment responses; the normal health JSON shape is unchanged.
- Native HTTP fixtures use the same before-write handshake. Cleanup is not started after a failed handshake. Native runner creates ephemeral verification secrets and disables unrelated providers.
- Authenticated browser execution is serialized and traces/screenshots default off. There is no production-host exception path.
- Added reproducible verify:browser and verify:media commands. The native runner seeds a fresh synthetic browser account, executes native HTTP then browser journeys, and cleans the account afterward. It retains incomplete media pointers for isolated reconciliation rather than discarding provenance.
- Added six dedicated R2 browser cases (avatar/banner across three devices) covering real UI upload, persisted metadata, delivery, reload, replacement, origin absence and scoped cleanup. They require a matching dedicated pnyx-e2e- bucket/endpoint/delivery declaration. No provider resources are provisioned by the tests or this change.
- Expanded native CI to install the locked Playwright browser and execute the reproducible browser verifier with R2 disabled.

## Security dependency corrections

Fresh npm audit found newer Effect and Next.js advisories. Updated Next.js 15.5.28 to 15.5.29 and scoped Prisma config's Effect dependency from 3.21.0 to 3.22.1. Prisma's major version and database schema are unchanged. The complete post-update audit reports zero known vulnerabilities without advisory exclusions; this supersedes the older thirteen-development-report count for this candidate only.

Primary advisory records: [Effect](https://github.com/advisories/GHSA-7589-6fvf-x4pw), [Next image optimizer](https://github.com/advisories/GHSA-7qx7-33qx-rqx2), [Next internal cookie header](https://github.com/advisories/GHSA-f3mh-rxg3-f5g2), [Next forwarded response framing](https://github.com/advisories/GHSA-pc58-hwjq-p385). Updating dependencies does not claim that any specific exploit was reproduced or that every possible vulnerability is excluded.

## Verification and limits

The [results file](test-isolation-2026-11-24-results.json) records passing TypeScript/lint/build, 130 unit tests, 18 disposable PGlite API scenarios, 90 browser checks, six R2 skips, security-header checks and zero dependency advisories. [Native PostgreSQL 16 CI](https://github.com/kellyxy110/Pnyx/actions/runs/45387692732) passes for code commit a05f1fe74d01a6fa9b07cbc715041f6d850911e5: all twelve migrations replay, no schema drift, 27 HTTP scenarios, 90 browser checks, six R2 skips, 130 unit tests, TypeScript/lint/build and both zero-vulnerability dependency audits. This also exercises the reproducible native browser runner, including its synthetic account and Web3 fixture lifecycle. Unit tests include unsafe target rejection, nonce/config/secret mismatch, ordinary health behavior and degraded health suppression. Local application checks use disposable PGlite with all twelve migration SQL files and are labelled separately from native PostgreSQL CI. No migration or fixture writes target production.

All five R2 values are absent from the current execution environment. Provider-backed cases remain skipped, not passed. The implementation is prepared and type/lint checked; real upload/removal requires a reviewed dedicated provider configuration. No production secrets were fetched or printed.

See [the operator runbook](isolated-verification.md) for exact prerequisites and commands. Media origin deletion does not prove CDN deletion: the existing long-lived immutable upload cache metadata still requires delivery-cache policy/withdrawal acceptance. Durable cleanup retry, provider-failure/account-deletion asset evidence, Windows checkout recovery and production-adjacent release acceptance remain open. No 6A closure, merge, deployment or integration activation is claimed.
