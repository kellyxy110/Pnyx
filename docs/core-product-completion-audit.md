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

- Latest shell deployment: `dpl_GWZs1TRkntfn8YnTQa9qF2d886EX` — READY, serving commit `f0eb371`.
- Production alias: `https://pnyx-psi.vercel.app`.
- Public application routes `/feed`, `/spaces`, `/knowledge`, `/explore`, `/ai`, and `/notifications`: HTTP 200.
- Unauthenticated `/profile`: HTTP 307 to sign-in.
- Provider endpoint: HTTP 200 with Credentials, Google, and GitHub.
- Health endpoint: HTTP 200.
- TypeScript: PASS.
- Unit tests: 22/22 PASS.
- Vercel production build: PASS.

Authenticated browser interaction still requires a real test account/session and is not falsely claimed as completed by the unauthenticated smoke test.

## Module 2 result — shared responsive application shell

Implemented and deployed:

- Shared three-column shell with persistent product header, left navigation, contextual right rail, and mobile navigation.
- Real global search form, notifications link, theme toggle, create-discussion link, user menu/session controls, and breadcrumbs-ready content structure.
- Tablet collapse removes the contextual rail; mobile collapses to a single column with bottom navigation.
- Fixed and verified the tablet AI guidance overflow at 768px.

Production evidence:

- Vercel deployment `dpl_GWZs1TRkntfn8YnTQa9qF2d886EX`: READY and aliased to `https://pnyx-psi.vercel.app`.
- Responsive production audit: 28/28 checks passed across mobile, tablet, desktop, and wide desktop.
- TypeScript: PASS; unit tests: 22/22 PASS; Vercel production build: PASS.

## Module 3 result — profile identity and activity

Implemented and deployed:

- Persisted profile headline, location, website, GitHub, LinkedIn, skills, interests, and visibility fields through migration `20260729123000_profile_completion`.
- Profile editor with real validation, activity counts, joined Spaces, discussions, knowledge contributions, bookmarks, and drafts.
- Privacy-aware public profiles at `/people/[username]`; follower-only visibility requires a persisted follower relationship and private profiles are not exposed.
- Cloudflare R2-compatible storage abstraction with server-side image validation, WebP normalization, replacement/deletion cleanup, and hidden upload controls until R2 configuration is present.

Production evidence:

- Deployment `dpl_AreSS2pMw4CpQenmvK4JZLeyUdE3`: READY and aliased to the production URL.
- Prisma migration deploy: 9 migrations found, no pending migrations.
- TypeScript: PASS; unit tests: 23/23 PASS; Vercel production build: PASS.
- Media configuration endpoint currently returns `enabled: false`, so production does not expose inactive upload controls.

## Module 4 result — following system

Implemented and deployed:

- Idempotent, authenticated follow/unfollow API with self-follow prevention, suspension guard, notification creation, and authorization checks.
- Optimistic follow button with rollback on error and real follower count response.
- Authenticated follower/following lists on the profile page.
- Existing Following feed now reads persisted `UserFollow` relationships, so follow actions change feed membership.

Production evidence:

- Deployment `dpl_6yRSFRb3bS5goACWtrK1pjeeAbQn`: READY and aliased to production.
- Unauthenticated network API: HTTP 401; follow route does not accept GET and remains write-method restricted; health: HTTP 200.
- TypeScript: PASS; unit tests: 23/23 PASS; Vercel production build: PASS.

## Remaining 6A modules

1. Profile completion
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

## Module 5 result — persisted composer workflow

Implemented and deployed:

- Authenticated composer creates real persisted drafts and safely recovers them after navigation or refresh.
- Debounced autosave updates the existing draft rather than creating duplicate records.
- Manual draft saving, draft selection, Markdown preview, validation, and publication are backed by the post APIs.
- Publishing an existing draft changes its persisted state and navigates to its real discussion route.

Production evidence:

- Deployment `dpl_8W4unJcBSsqGpjy2pfkjbvdYP8xg`: READY and aliased to `https://pnyx-psi.vercel.app`.
- Public feed: HTTP 200; latest-post API: HTTP 200; protected draft list: HTTP 401 when unauthenticated.
- TypeScript: PASS; unit tests: 23/23 PASS; Vercel production build: PASS.

Authenticated draft creation and recovery requires a controlled signed-in browser account and remains part of the end-to-end Playwright evidence backlog.
