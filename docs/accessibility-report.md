# Automated accessibility and responsive evidence

Updated: 2026-07-29
Production audited: https://pnyx-psi.vercel.app

## Automated evidence

- Static accessibility checks: 8/8 passed via `node scripts/audit-static-accessibility.mjs`.
- Security header checks: 5/5 passed via `node scripts/audit-security-config.mjs`.
- Playwright + axe browser checks use Chromium emulation for mobile, tablet, and desktop.
- Public route axe checks passed for `/`, `/sign-up`, `/explore`, `/spaces`, `/knowledge`, and `/ai`.
- `/sign-in` axe checks passed on desktop, tablet, and mobile after the authentication contrast correction.
- Keyboard focus check passed: Display Name receives focus, Tab advances to Username, and reduced-motion mode is detected.
- Viewport overflow checks passed for the targeted route runs.
- Production smoke responses were HTTP 200 for `/` and `/api/auth/providers`.

The browser suite is committed in `playwright.config.ts` and `tests/e2e/public-routes.spec.ts`. Generated screenshots, traces, and HTML reports are intentionally ignored by Git.

## Fixes made from automated evidence

- Replaced low-contrast gold text token with an accessible dark-gold text value while preserving decorative brand gold.
- Corrected low-contrast authentication kicker, muted provider, divider, and helper text colors.
- Added a deterministic render-settle wait before axe analysis to avoid stylesheet-load races.

## Remaining verification

- Manual screen-reader audit remains open.
- Manual Lighthouse review and real-device verification remain open.
- Browser-based authenticated flows require test accounts and are not run against production.

## Classification

Automated accessibility and targeted responsive checks: COMPLETE.
Manual accessibility/device review: READY FOR HUMAN VERIFICATION.
