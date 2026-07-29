# Milestone 6A — Core product completion audit

Updated: 2026-07-29  
Production: https://pnyx-psi.vercel.app

## Honest current state

Pnyx is not feature-complete. Infrastructure, authentication providers, Prisma migrations, deployment, and the existing API foundation are operational. The product UI still has incomplete journeys and is being completed module-by-module.

## Module 1 result — authenticated application state

Implemented and deployed:

- Server-rendered session lookup in the shared product navigation.
- User-specific display name, username, avatar URL, fallback initials, and unread notification count.
- Authenticated user menu with profile, notifications, and sign-out actions.
- Unauthenticated navigation with real Sign in and Join Pnyx links.
- Real notification list with mark-read and mark-all-read API actions.
- Shared navigation integrated into Community, Spaces, Knowledge, Explore, AI, Profile, Notifications, Moderation, Discussion detail, and Knowledge detail routes.
- Authenticated profile and moderation redirects remain enforced.
- Responsive navigation behavior for narrow screens.

## Production evidence

- Latest deployment: `dpl_CrRQGYdNc1vNETPk2dxgWca3gg7U` — READY.
- Production alias: `https://pnyx-psi.vercel.app`.
- Public application routes `/feed`, `/spaces`, `/knowledge`, `/explore`, `/ai`, and `/notifications`: HTTP 200.
- Unauthenticated `/profile`: HTTP 307 to sign-in.
- Provider endpoint: HTTP 200 with Credentials, Google, and GitHub.
- Health endpoint: HTTP 200.
- TypeScript: PASS.
- Unit tests: 22/22 PASS.
- Vercel production build: PASS.

Authenticated browser interaction still requires a real test account/session and is not falsely claimed as completed by the unauthenticated smoke test.

## Remaining 6A modules

1. Three-column responsive application shell.
2. Profile completion and real upload/storage flow.
3. Community feed/composer/discussion journey completion.
4. Following system.
5. Spaces detail and membership completion.
6. Knowledge reading surface completion.
7. Explore discovery completion.
8. AI assistance truthfulness and supported interaction completion.
9. Cross-module Playwright journeys using a controlled authenticated test account.

## Explicitly paused

Milestone 6B resilience/security and Milestone 6C closed-beta work are paused until 6A core product journeys are complete.
