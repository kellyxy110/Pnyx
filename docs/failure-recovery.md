# Failure recovery report

## Implemented behavior

- Zod rejects malformed account, discussion, knowledge, and search input.
- Database-backed limits return HTTP 429 for posting, replies, reports, and appeals.
- Resend failures are classified server-side, logged with secret-safe diagnostics, and returned to users as friendly errors.
- Initial registration removes the newly created account when verification delivery fails.
- Resend-verification removes the newly created token after delivery failure and uses neutral messaging.
- Health returns degraded status when PostgreSQL is unavailable without returning database details.
- AI assistance has timeout, retry, unavailable, and failure states and does not auto-publish verified content.

## Pending tests

- Database outage during reads/writes.
- Provider timeout and retry exhaustion.
- Redis failure path if Redis is introduced.
- Duplicate registration and duplicate action requests.
- Recovery after interrupted migration or deployment.
- Notification and search-index failure behavior.

No production fault injection was performed.

