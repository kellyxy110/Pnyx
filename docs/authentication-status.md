# Authentication release status

## Accepted and complete

The authentication redesign was accepted in commit `82d748b` and is deployed at https://pnyx-psi.vercel.app.

Email/password registration and sign-in remain the supported production authentication path. The registration API, Auth.js Credentials provider, Prisma persistence, verification email flow, password recovery, field validation, and responsive authentication UI remain unchanged in contract and operational behavior.

## Safely gated pending configuration

Google and GitHub OAuth are implemented as Auth.js provider hooks but are not active unless their complete credentials exist at runtime:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

When credentials are absent, the corresponding controls display a clear not-configured message and do not attempt a failing provider request. No credential values are stored in the repository or documentation.

## Manual release QA

Lighthouse and screen-reader audits remain manual release-QA tasks. They are not represented as completed by repository checks.

## Current Loop Engineering selection

Milestone 6 — Beta readiness remains the next incomplete milestone. No later milestone has been started.