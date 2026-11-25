# Pnyx Milestone 6A Acceptance Record

Status: OPEN — controlled release is not yet accepted.

## Evidence context

- Tested source revision: ec6d4e64d834a2257bde51f8261faf82b9527215 plus the uncommitted working-tree changes listed below.
- Production target: https://pnyx-psi.vercel.app
- Current deployment identity: BLOCKED — no hosted deployment inspection was performed in this read-only pass.
- Production data, credentials, forms, email, and browser sessions were not accessed.
- Earlier ERR_NETWORK_ACCESS_DENIED browser results remain environment evidence, not application passes.

## Automated checks

| Check | Result | Evidence |
|---|---|---|
| TypeScript | PASS | npm run typecheck, exit 0 |
| ESLint | PASS | npm run lint, exit 0; no ESLint warnings/errors |
| Unit and focused tests | PASS | 20 files / 71 tests passed with npm test |
| Production build | PASS | npm run build, exit 0 using process-scoped disposable loopback DATABASE_URL |
| Database-backed runtime validation | BLOCKED | No disposable database service was available; production credentials were not used |
| Diff integrity | PASS | git diff --check, exit 0 |
| Secret scan of diff | PASS | No matching secret material found |

Build success proves compilation and static generation only. It does not prove database connectivity, authentication runtime, storage, email, or deployed behavior.

## Required 6A acceptance checks

| Check | Result | Evidence / owner-run expectation |
|---|---|---|
| Canonical production URL and deployment identity | BLOCKED | Confirm pnyx-psi.vercel.app resolves to the reviewed commit and READY deployment |
| Google sign-in | NOT RUN | Owner must sign in through Google and confirm session/profile navigation |
| OAuth password setup, sign-out, credentials sign-in | NOT RUN | Owner must create a password, sign out, then sign in with credentials |
| Fresh email verification using canonical origin | NOT RUN | Owner must request a fresh email and confirm the link uses pnyx-psi.vercel.app |
| Password recovery | NOT RUN | Owner must request and consume a fresh reset link |
| Protected-route refresh and logout | NOT RUN | Owner must refresh /feed or /profile, then sign out and confirm access is removed |
| Profile save navigates to public profile | NOT RUN | Owner must save profile details and confirm the public profile shows fresh data |
| Avatar/banner upload, replacement, persistence | NOT RUN | Owner must upload, replace, refresh, and verify media persistence |
| Discussion draft, publish, reply | NOT RUN | Owner must save/recover a draft, publish, and reply in a Space |
| Knowledge draft and publication workflow | NOT RUN | Owner must create a private draft and verify the intended publication path |
| Search filters, empty state, failure recovery | NOT RUN | Owner must exercise filters, no-results state, retry, and successful recovery |
| Desktop, tablet, and mobile layout | BLOCKED | Hosted browser checks previously failed with sandbox ERR_NETWORK_ACCESS_DENIED; do not treat as a pass |
| Keyboard focus, labels, errors, basic accessibility | NOT RUN | Owner-run browser and keyboard review required |

Historical reports of Google sign-in, uploads, profile errors, and verification-link problems are retained as historical observations only; they are not acceptance evidence for this un-deployed working tree.

## Highest-risk source review

- Recovery payloads are validated by src/lib/recovery-validation.ts before hashing or database access.
- Recovery forms use try/catch/finally in src/components/recovery-forms.tsx, preserving form values after network failure.
- Feed request cancellation and sequence checks are in src/components/feed.tsx; failed optimistic reactions/bookmarks restore the prior item without replacing loaded pages.
- Composer draft and publish failures are handled in src/components/post-composer.tsx; input remains intact and busy state is released.
- Poll creation is removed from the new-post selector; existing poll records and draft types remain readable.
- Unsupported Markdown claims were removed from composer and knowledge editing copy; no renderer was introduced.
- Authentication activity numbers were replaced with factual product copy in src/components/auth-shell.tsx.
- Invalid verification and reset links point to existing sign-in, sign-up, resend, and recovery routes.
- src/app/not-found.tsx provides Community, Explore, and Spaces navigation.

## Exact reviewed release file list

    src/app/api/account/forgot-password/route.ts
    src/app/api/account/reset-password/route.ts
    src/app/api/account/verify-email/route.ts
    src/app/explore/page.tsx
    src/app/knowledge/new/page.tsx
    src/app/layout.tsx
    src/app/not-found.tsx
    src/app/reset-password/page.tsx
    src/app/verify-email/page.tsx
    src/app/workspace.css
    src/components/ai-assist-panel.tsx
    src/components/auth-shell.tsx
    src/components/explore-discovery.tsx
    src/components/feed.tsx
    src/components/knowledge-editor.tsx
    src/components/post-composer.tsx
    src/components/post-detail.tsx
    src/components/product-nav.tsx
    src/components/recovery-forms.tsx
    src/components/search-browser.tsx
    src/lib/recovery-validation.test.ts
    src/lib/recovery-validation.ts
    src/lib/request-failure.test.ts
    src/lib/request-failure.ts
    docs/6a-acceptance-record.md

Authentication, OAuth password setup, APP_URL helpers, profile navigation, R2 configuration, privacy controls, and migrations are preserved and are not included in the bounded feature changes above.

## Owner-run release procedure

Review the exact file list, then run:

    git status
    npm run typecheck
    npm run lint
    npm test
    npm run build
    git add src/app/api/account/forgot-password/route.ts src/app/api/account/reset-password/route.ts src/app/api/account/verify-email/route.ts src/app/explore/page.tsx src/app/knowledge/new/page.tsx src/app/layout.tsx src/app/not-found.tsx src/app/reset-password/page.tsx src/app/verify-email/page.tsx src/app/workspace.css src/components/ai-assist-panel.tsx src/components/auth-shell.tsx src/components/explore-discovery.tsx src/components/feed.tsx src/components/knowledge-editor.tsx src/components/post-composer.tsx src/components/post-detail.tsx src/components/product-nav.tsx src/components/recovery-forms.tsx src/components/search-browser.tsx src/lib/recovery-validation.test.ts src/lib/recovery-validation.ts src/lib/request-failure.test.ts src/lib/request-failure.ts docs/6a-acceptance-record.md
    git diff --cached --check
    git commit -m "fix: complete bounded 6A recovery and interaction fixes"
    git push origin main
    vercel project inspect pnyx --scope kellyxys-projects
    vercel ls pnyx --scope kellyxys-projects
    vercel inspect <deployment-url> --scope kellyxys-projects

Confirm the READY deployment commit matches the pushed commit and that pnyx.vercel.app is not being used as the canonical alias. The canonical target for this stage is pnyx-psi.vercel.app.

Rollback must use a revert commit:

    git revert <release-commit>
    git push origin main

Never reset history or force-push.

## Locked roadmap accounting

### 6A — Core Product Completion

OPEN. Automated code checks pass, but deployed functional, browser, storage, email, and accessibility acceptance evidence is still required.

### 6B — Resilience and Security (locked)

- Load and failure-recovery testing
- Backup and restore verification
- Deletion propagation
- Security and abuse testing
- Production-safe operational evidence

### 6C — Closed Beta Readiness (locked)

- Manual Lighthouse review
- Screen-reader QA
- Real-device responsive QA
- Closed-beta recruitment and consent
- Human evidence review

## Verdict

NOT READY FOR 6A SIGN-OFF. The bounded source changes pass local checks, but the release has not been deployed or verified through the required owner-run production journeys.
