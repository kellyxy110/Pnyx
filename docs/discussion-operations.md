# Discussion operations

The discussion loop is backed by PostgreSQL and Prisma. Posts are created through `/api/posts`, replies through `/api/posts/:id/replies`, and feed reads are permission-aware for blocked users and muted Spaces.

Posting is limited per authenticated user to five posts per minute and twenty replies per minute. The limits are database-backed and return HTTP 429. Post deletion is a soft delete so the discussion record and moderation history remain recoverable. Reports are stored for moderation review.

Required production environment values are documented in `.env.identity.example`. Credentials must be configured in the deployment platform and never committed to the repository.
