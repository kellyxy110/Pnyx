# Pnyx

Pnyx is a technology knowledge network where conversations become organised knowledge.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and provide local-only values.
3. Validate Prisma with `npm run db:validate` and generate the client with `npm run db:generate`.
4. Run `npm run lint`, `npm run typecheck`, and `npm test -- --run`.
5. Start locally with `npm run dev`.

Never commit `.env`, database URLs, API keys, OAuth secrets, or authentication secrets.

## Production email prerequisite

Verification and recovery email delivery uses Resend and `EMAIL_FROM`. Production email cannot be signed off until the sender domain is verified in Resend. Follow [the production Resend runbook](docs/resend-production-email.md) before testing signup or resend-verification in production.

The application records privacy-safe provider errors and gives users a neutral recovery message. It never logs API keys, passwords, verification tokens, or database credentials.

## Current release status

Milestones 0–5 are implemented. Milestone 6 remains open until its accessibility, responsive, resilience/security, closed-beta, and evidence gates are complete. OAuth credentials and manual Lighthouse/screen-reader checks remain release tasks. See [tasks.md](tasks.md) and [definition-of-done.md](definition-of-done.md).

The canonical production URL is `https://pnyx-psi.vercel.app`. The ownership of `pnyx.vercel.app` is tracked separately as infrastructure backlog.
