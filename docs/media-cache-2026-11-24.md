# Profile media cache correction — 24 November 2026

Branch: audit/pnyx-remediation-20261025. Milestone 6A remains OPEN; 6B/6C remain PAUSED.

New profile image uploads request `Cache-Control: no-store` instead of a year of public immutable caching. Upload and deletion clients now close in finally blocks on success and provider failure. Six SDK-boundary tests verify metadata, receipt, exact deletion target, failure propagation, resource closure and preflight configuration rejection.

Prepared isolated R2 acceptance now checks origin metadata, delivery no-store policy, absence of cache-hit/stale signals, zero Age and WebP decoding/dimensions. These provider assertions have not executed: all five R2 configuration values and expected target declarations are absent. A provider connection search found no suitable R2 plugin; the Cloudflare dashboard requires sign-in. No provider resource or credential was created.

Local TypeScript, zero-warning lint, all 136 unit tests (23 files) and production build passed. Native PostgreSQL 16 CI passed for code commit `709cbf551a7abbfe038e7ac012e6b906b61ff055`: all 12 migrations replayed, drift check passed, 27 HTTP scenarios and 90 browser checks passed; six R2 cases skipped. CI also passed all 136 unit tests, TypeScript, zero-warning lint, build and both dependency audits with zero vulnerabilities. [CI run 45393619182](https://github.com/kellyxy110/Pnyx/actions/runs/45393619182), job 138443486795.

This correction affects future uploads only. Historical metadata, existing browser/CDN copies, provider overrides and delivery withdrawal/purge still require explicit acceptance. Durable cleanup retry, account-deletion asset acceptance and production-adjacent verification remain open. No merge, deployment, production database operation or integration activation was performed.
