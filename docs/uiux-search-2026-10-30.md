# Search and writing surfaces — 30 October 2026

Branch: `audit/pnyx-remediation-20261025`. Base: `fee4046350a55532feec6bd408fd40185705cdf9`.

This is an implemented UI/UX pass grounded in repository review and automated browser checks. It is not a completed screenshot-based design audit: the cloud browser refused local-preview access. No screenshots were captured through an alternate browser surface. Visual approval, real-device review, and screen-reader evaluation remain outstanding.

## Design direction

Build on Pnyx’s navy, blue, ivory, and gold identity. Search becomes the first task on Explore, with an editorial heading, a prominent writing surface, a restrained blue accent, and compact progressive refinement. Shared inputs and textareas use consistent borders, soft depth, generous padding, readable type, and clear focus/error/disabled states. Dark mode uses explicit field and action tokens.

## Findings and implemented corrections

| Step | Finding and change | Verification / health |
| --- | --- | --- |
| 1. Enter search | The header submitted `q`, but Explore never read it. Explore now initializes and executes the supplied query. The query field precedes discovery lists; the duplicate page heading was removed. | Query handoff and clear/focus checks pass. |
| 2. Refine | Numerous filters competed with the primary query. Search used separate desktop fields and a mobile drawer with mismatched breakpoints. One native disclosure now exposes the same labeled filters at every width, with an active count and reset. | Keyboard disclosure, filter requests/reset, and narrow/breakpoint reflow checks pass. |
| 3. Read and recover | Network/JSON failures could leave the action busy. Search now catches failures, releases the action, offers retry, announces results, and shows a helpful empty state. Superseded requests are aborted. | Network failure and retry pass; empty-state/reset checks pass. |
| 4. Continue results | Load more read unsent edits, potentially mixing different searches. Pagination now retains the last submitted criteria and announces the combined loaded count. | Query-edit/pagination regression passes. |
| 5. Write | Field spacing, boundaries, focus, and type varied between search, Spaces, profile, composer, knowledge, and auth. A shared field treatment provides at least 16px type and 48px control height, vertical textarea resizing, and reduced-motion/forced-color handling. | Sign-in geometry/focus checks and existing authenticated profile/composer journeys pass. Visual review of every writing surface remains open. |
| 6. Understand actions | `.panel`, `.button-outline`, `.badge`, and `.help` were referenced without base definitions. Added shared card, secondary-button, badge, and helper foundations. Header search now has an explicit submit control and a label independent of that button. | Public-route accessibility/reflow and query-entry checks pass. |
| 7. Switch theme | Dark primary actions inherited a near-white background with white text. Theme transitions and page opacity fades also produced insufficient contrast during checks. Added action tokens, accessible dark accent colors, and removed background-color interpolation/text opacity fades. Auth retains its light writing panel. | Expanded Explore has zero axe violations in both themes at all three configured devices. |
| 8. Assess trust | Auth displayed invented activity counts and clickable Apple/Microsoft placeholders. Replaced numbers with product copy, removed unavailable placeholder actions, and clarified provider availability. AuthShell no longer needs a client timer. | Public auth accessibility/reflow checks pass. Configured Google/GitHub flows and email authentication behavior are preserved. |

## Verification

See [machine-readable results](uiux-search-2026-10-30-results.json). TypeScript, ESLint, Vitest, production build, dependency audit, security configuration/headers, and the Playwright suite were executed locally. **Results: 70/70 unit tests; 72 browser checks passed, three R2 checks skipped, zero failed; zero known dependency advisories.** Expanded Explore passed light/dark axe checks on mobile, tablet, and desktop. Additional reflow checks covered 320, 360, 760, 767, 1024, and 1440px. Browser checks use an isolated PGlite database with all 12 repository migration SQL files applied and a synthetic fixture account/Space. They are UI regression evidence, not a new native PostgreSQL concurrency certification. The earlier native PostgreSQL evidence remains separate.

The browser runtime is Chromium 153 from `@sparticuz/chromium` 153.0.0, used via `PLAYWRIGHT_EXECUTABLE_PATH`; the standard Playwright Chromium download returned invalid archives. Temporary runner configuration used one worker, disabled trace/screenshots, and supplied disposable credentials. No runtime package or fixture database was added to the repository.

The three media checks remain skipped because no isolated R2 configuration was provided. No merge, deployment, production database access, schema change, dependency change, or unrelated branch modification was performed. The branch-specific Vercel deployment guard remains unchanged.

## Remaining design review

- Review the final screens visually in a permitted preview, particularly profile/composer textareas and filled/error states.
- Walk through with a screen reader and real touch devices; axe does not establish full WCAG compliance.
- Review search relevance/ranking and category-specific filter semantics separately from this presentation pass.
- Resume the pending isolated R2 verification gate; this UI work does not close Milestone 6A or unlock 6B/6C.
