# Resend production email runbook

## Current finding

The application reaches Resend, but Resend returns HTTP 403 with `validation_error` and `UNVERIFIED_SENDER_DOMAIN`. The configured sender domain is not verified in the Resend account used by the API key.

## Required manual setup

1. Sign in to the Resend dashboard for the account owning the production API key.
2. Open **Domains** and select **Add Domain**.
3. Add the exact domain used by `EMAIL_FROM`. The current sender is `noreply@mail.pnyx.vercel.app`, so the domain is `mail.pnyx.vercel.app`.
4. In the DNS provider for `pnyx.vercel.app`, create every DNS record Resend displays. Preserve the exact type, host/name, value, and verification settings. Do not put these values in the repository.
5. Wait for DNS propagation, then select **Verify** in Resend. Continue only when the dashboard says the domain is verified.
6. Confirm the sender is exactly `noreply@mail.pnyx.vercel.app` with display name `Pnyx`. Verifying only the parent domain does not necessarily verify the `mail` subdomain.
7. In Vercel, inspect the Production and Preview `EMAIL_FROM` variables by name and keep them aligned with the verified domain. Do not print or replace secret values.
8. Confirm `RESEND_API_KEY` exists in the same environment and belongs to the Resend account where the domain was verified.
9. Send one controlled verification email to an account you own. Do not send arbitrary or bulk email.
10. Inspect application logs. A successful request must not produce the Resend 403 classification.

## Diagnosis guide

- `resend.dev` recipient restriction: test only with the Resend account email or verify a custom domain.
- `UNVERIFIED_SENDER_DOMAIN`: verify the exact sender domain and its DNS records.
- Verified-domain mismatch: compare the complete domain, including subdomains, between Resend and `EMAIL_FROM`.
- API-key permission failure: use a key permitted to send from the verified domain.
- Account or quota restriction: resolve the account notice in Resend; application code cannot fix it.

## Application safety

Signup and resend-verification use `EMAIL_FROM`; there is no hard-coded production sender. Failed initial delivery removes the unusable verification token, resend requests are rate limited, and user-facing responses are enumeration-safe. Provider diagnostics contain only safe classification, status, message, and request ID.

## Acceptance evidence

Record only: Resend domain status **Verified**, environment, sender domain, delivery accepted by Resend, and an optional request ID. Never record API keys, verification links, passwords, token values, or database connection strings.
