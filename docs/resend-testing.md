# Resend testing configuration

Pnyx does not own `vercel.app`, so `mail.pnyx.vercel.app` must not be used or recommended as a sender.

For the current Resend testing configuration, keep:

```text
EMAIL_FROM=Pnyx <onboarding@resend.dev>
```

The `onboarding@resend.dev` sender is restricted by Resend. Send signup and resend-verification tests only to the email address linked to the Resend account that owns `RESEND_API_KEY`. A different recipient can correctly produce HTTP 403.

The application reads the sender from `process.env.EMAIL_FROM` in `src/lib/mail.ts` and sends to the account email supplied to registration or resend-verification. It does not hard-code the sender.

When Resend rejects a request, the server logs the provider error name, sanitized message, HTTP status, request ID, sender domain, recipient domain, and classified cause. API keys, passwords, verification tokens, full email addresses, and database URLs are not logged.

Expected testing procedure:

1. Confirm `RESEND_API_KEY` is present in the target environment without displaying its value.
2. Confirm `EMAIL_FROM` is `Pnyx <onboarding@resend.dev>` without displaying secrets.
3. Use the email address linked to the Resend account as the signup recipient.
4. Test resend-verification for that same address.
5. Inspect server logs for the exact Resend `name`, sanitized `message`, `statusCode`, and `requestId`.
6. Treat HTTP 403 testing-recipient responses as an external Resend restriction, not a signup-flow failure.
