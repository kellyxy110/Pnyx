# Performance and responsive report

Updated: 2026-07-29
Production audited: https://pnyx-psi.vercel.app

## Responsive evidence

Command: `npm run audit:responsive`

- Viewports: mobile 390×844, tablet 768×1024, desktop 1440×900, wide desktop 1920×1080.
- Routes: `/`, `/sign-in`, `/sign-up`, `/spaces`, `/explore`, `/knowledge`, `/ai`.
- Checks: HTTP status, main landmark, document overflow, and viewport width.
- Result: 28/28 passed; 0 failures.

## Build evidence

The latest Vercel production build completed successfully for Next.js and Prisma and generated the core routes.

## Still open

- Lighthouse CI scores and Core Web Vitals.
- Authenticated flow visual regression and real-device review.
- Bundle analysis and route-level performance budgets.

## Classification

Responsive public-route automation: COMPLETE.
Lighthouse and real-device review: READY FOR HUMAN VERIFICATION.
