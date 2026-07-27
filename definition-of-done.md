# Pnyx Strict Definition of Done

This gate is mandatory for every implementation loop. A milestone cannot be marked complete and the next milestone cannot begin until every applicable item is evidenced in the engineering report.

- Functional implementation is complete end to end; no placeholders, fake data, mock APIs, broken buttons, or unapproved TODOs.
- Integration with existing architecture, authentication, permissions, notifications, and analytics is complete where applicable.
- PostgreSQL persistence uses a reviewed, runnable Prisma schema and migration for every owned durable data path.
- User input is validated at boundaries; safe errors, failure states, retry behavior, and destructive-action handling are implemented.
- Loading, empty, success, error, unavailable, unauthorized, and deleted states are implemented where applicable.
- UI follows `design.md` and works at mobile, tablet, and desktop breakpoints.
- Applicable WCAG 2.2 AA checks pass: semantic structure, keyboard access, visible focus, labels, contrast, status announcements, and reduced motion.
- TypeScript, ESLint, production build, unit tests, integration tests, and end-to-end tests appropriate to the risk pass.
- Security, privacy, abuse prevention, rate limits, auditability, logging, health checks, and operational alerts are addressed.
- Environment examples, migration/runbook documentation, decision records, and affected task checkboxes are updated.
- Deployment prerequisites, rollback considerations, and ownership are documented.
- The change is committed with a clear message and the report identifies any non-applicable checks.

Any failing or unavailable gate is a blocker. “Scaffolded” is not “complete”.
