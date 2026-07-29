# Decision addendum — 2026-07-29

## Resend testing sender

Until Pnyx owns a verified sending domain, use `Pnyx <onboarding@resend.dev>` and send tests only to the email address linked to the Resend account. Pnyx does not own `vercel.app`; `mail.pnyx.vercel.app` must not be used or recommended.

The application must read `EMAIL_FROM`, send to the submitted account email, log the sanitized Resend error name/message/status/request ID server-side, and return a friendly error to users.

## Milestone closure

Milestone 6 remains open until accessibility, responsive behavior, resilience/security testing, closed-beta recruitment, and beta evidence are complete. OAuth setup and manual release QA remain separate gates. Later modules are gated until the current milestone satisfies the strict Definition of Done.

## Repository and deployment identity

The configured GitHub remote is `https://github.com/kellyxy110/Pnyx.git`, confirming the repository owner as `kellyxy110`. Local Vercel metadata confirms the linked project name is `pnyx`; the local metadata contains an opaque team identifier, not a human-readable account name. No deployment was performed.
