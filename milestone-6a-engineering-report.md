# Milestone 6A engineering report

## Implemented

- Extracted session-token resolution into `src/lib/auth-session.ts` so a transient database error during JWT refresh no longer forces re-authentication; only a confirmed suspension revokes `token.userId`.
- Made Space membership and user-follow toggles server-authoritative: `POST`/`DELETE` on `/api/spaces/[slug]/membership` and `/api/spaces/[slug]/follow` now return the real post-mutation count from `prisma.*.count()` instead of letting the client compute it, and a shared `useToggleAction` hook replaced three duplicated hand-rolled implementations that tracked state independently per card.
- Repaired the discussion-detail page: it previously rendered its own `<main className="shell">` (not a real CSS class) instead of participating in the shared `.app-shell` grid, which put the "Keep exploring" panel above the discussion on mobile and broke bottom-nav-safe padding.
- Split Knowledge authoring out of the library listing into its own auth-gated `/knowledge/new` route, replaced the raw Space-slug and discussion-ID text fields with a real Space picker and a paste-a-link/ID field, and made the Explore Space filter use the same picker instead of a raw slug input.
- Added an accessible mobile filter drawer (`src/components/drawer.tsx`, a native `<dialog>`-based bottom sheet) for Explore's secondary filters (Space/Author/Verification/date range), with a "Filters" trigger showing the active-filter count.
- Added relative-time display to Community feed cards (`src/lib/relative-time.ts` extracted from `notification-list.tsx`) and search/filter/tabs to the Spaces directory (Featured/Following/Joined/All).
- Fixed the public profile page: it never selected `bannerKey`, so uploaded banners never rendered; it now resolves the banner through `publicUrlForKey()` like the rest of the account API. Owners now see an "Edit profile" link, and Followers/Following counts link to new privacy-aware `/people/[username]/followers` and `/people/[username]/following` pages built on a shared `PersonList` component.
- Updated the seeded Space taxonomy (`prisma/seed.ts`): the "Web" Space is renamed "Web3" (slug unchanged to preserve existing links), and a new "Cryptocurrency" Space was added.

## Verification

- TypeScript, ESLint, and the full Vitest suite (55 tests / 14 files) passed after each batch.
- Production build (`next build`) passed after each batch, including the new `/people/[username]/followers` and `/people/[username]/following` routes.
- Each batch was pushed to `main` and confirmed `READY` in Vercel production before moving to the next.

## Outstanding for Milestone 6A

- Configure and production-verify Cloudflare R2 avatar/banner media uploads (external credential task; upload code is complete but feature-gated behind `storageEnabled`).
- Apply the updated `prisma/seed.ts` taxonomy to the production database (`npm run db:seed`) — not yet run against production from this environment.
- Add authenticated Playwright journey coverage and production evidence.
- AI Assistance panel redesign, further Profile polish (tab navigation), and a systematic accessibility/responsive breakpoint QA pass remain open.
