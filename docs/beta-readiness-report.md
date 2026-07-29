# Beta readiness report

Date: 2026-07-29  
Production: https://pnyx-psi.vercel.app  
Latest verified commit: 3ec88aa  
Latest deployment: READY, aliased to the canonical production URL

## Complete

- Existing unit suite: 8 files, 16 tests passed.
- TypeScript: passed.
- ESLint: passed with only existing Next.js deprecation/workspace-root warnings.
- Static accessibility audit: 8/8 repository checks passed.
- Secret-pattern scan: no matches.
- Vercel production build: passed with Prisma generation, Next.js compilation, and route generation.
- Resend sender wiring: code reads `EMAIL_FROM`; delivery remains restricted to the Resend-account email.
- OAuth gating: Auth.js includes Google/GitHub only when complete credentials exist; unavailable controls are disabled with a Coming soon state.

## Ready for human verification

- Axe/Lighthouse browser audits.
- Keyboard-only and manual screen-reader review.
- Mobile/tablet/laptop/wide desktop review.
- Closed-beta consent and usability review.
- Isolated backup/restore and deletion-propagation exercise.

## External blockers

- GitHub OAuth is not present in the inspected Vercel environment list; live GitHub OAuth testing requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- Resend `onboarding@resend.dev` can be tested only with the email linked to the Resend account.
- Local Prisma validation/build requires a local `DATABASE_URL`; no secret was fabricated.
- Dependency audit remediation requires a deliberate framework upgrade because forced remediation proposes a breaking downgrade.

## Not complete

Milestone 6 is not formally closed. Closed-beta recruitment, real-user feedback, legal/privacy approval, manual accessibility review, browser performance evidence, isolated backup/restore, deletion propagation, authenticated load testing, and security-abuse testing remain open.

