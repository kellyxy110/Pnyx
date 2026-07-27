# Pnyx Foundation Operations

## Required configuration

`DATABASE_URL` and `APP_URL` are required. `LOG_LEVEL` controls structured application logs. `ANALYTICS_ENABLED` defaults to false and must be explicitly enabled after privacy review.

## Deploy

Install dependencies with `npm ci`, validate the Prisma schema, run `npm run db:migrate`, and then start the web process with `npm run start`. Migrations must run once per release against the deployment database.

## Health and rollback

The platform should probe `GET /api/health`. HTTP 200 means the application can reach PostgreSQL; HTTP 503 means degraded service. The endpoint never returns database details. Roll back application code only after confirming migration compatibility; do not delete applied migrations or production data.

## Observability

Application logs are JSON lines with level, timestamp, message, and safe contextual fields. Do not log credentials, request bodies, private content, tokens, or database URLs. Audit events are durable records for security-relevant actions. Analytics is opt-in at the foundation layer.
