# Identity and Spaces Operations

Milestone 1 requires `AUTH_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` in the deployment secret manager. `DATABASE_URL` must point to the migrated Prisma Postgres database.

Registration creates a bcrypt password hash and sends a 24-hour verification link through Resend. Unverified accounts cannot sign in. Password-reset links are single-use and expire after one hour. Tokens are stored as SHA-256 hashes, never in plaintext.

The Auth.js session uses a signed JWT. Account deletion cascades through owned content, membership, follows, audit events, and tokens. Space creation is restricted to moderators and administrators; joining and following require an authenticated user.
