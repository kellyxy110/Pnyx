# Security report

## Evidence already present

- Prisma-backed authorization helpers and permission tests.
- Server-side Zod validation for account, discussion, knowledge, and search inputs.
- Authenticated moderation and appeal gates.
- Database-backed post, reply, report, and appeal rate limits.
- Deterministic tests for post, reply, report, and appeal limits, including rate-limit audit-event recording.
- Account deletion with cascading identity/content relations.
- Safe structured logging and tracked-source secret scan.
- Production build, typecheck, lint, and unit-test evidence in milestone reports.
- Automated production security-header audit (`npm run audit:security-headers`) verifies HSTS, framing, MIME sniffing, referrer, and permissions policies.

## Findings

- `npm audit --omit=dev --audit-level=high` reports three nested postcss/sharp findings. `npm audit fix --force` is unsafe because it proposes a breaking Next.js downgrade.
- Browser-level XSS, CSRF, IDOR, upload, brute-force, and moderation-bypass testing remains unexecuted.
- OAuth live testing is blocked until provider credentials exist.

## Classification

PARTIALLY COMPLETE. No security finding is marked resolved without a reproducible test and safe fix.

