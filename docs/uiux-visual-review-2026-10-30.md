# Pnyx visual review — 30 October 2026

The earlier localhost preview restriction is resolved for this review through the supported Sites preview service. The user explicitly authorized a separate, owner-only review Site with synthetic data. Pnyx production, production databases, and its branch deployment guard remain untouched.

## Scope and evidence

The review uses copied SearchBrowser, ProfileEditor, PostComposer, navigation and theme components with the exact compiled Pnyx CSS. Server identity/data reads are replaced by fictional fixtures, and small Next.js adapters provide preview navigation and images. This is visual/component evidence, not a deployed copy of the full Pnyx backend. The separate Site contains the inspected screenshots, before/after comparisons, source provenance and review notes.

## Flow review

| Step | Surface | Health and findings |
| --- | --- | --- |
| 1 | Desktop search | Clear primary query, restrained blue frame, readable field boundaries and distinct submit action. Screenshot 01. |
| 2 | Mobile search and filters | Query/action stack cleanly at 390px. Expanded desktop filters have aligned fields and explicit labels. Screenshots 02 and 13. Real-device keyboard/focus occlusion remains a manual check. |
| 3 | Results, empty and error states | Result categories are distinct; empty/error panels give a next step without hiding the search controls. Screenshots 09–11. Data/ranking in this preview is synthetic. |
| 4 | Dark profile | Failed initially: hard-coded heading/copy colors nearly vanished, and avatar initials were white on white. Corrected heading/copy to theme tokens and avatars to action background/foreground tokens. Screenshots 05/06 before/after. |
| 5 | Profile text fields | Bio and text inputs have consistent spacing, readable type and visible boundaries in dark mode. Screenshot 07. Helper text no longer stretches neighbouring fields. |
| 6 | Composer | Failed initially: an internal guidance rail competed with the app shell rails, narrowing writing to roughly half the centre column; guidance inherited a display-sized heading. Writing now fills the centre column, with smaller guidance below and a compact intro. Screenshots 08/15 before/after. Space/type controls align despite helper text. Screenshot 14. |
| 7 | Mobile account menu | The authenticated axe check found an unnamed button after responsive CSS hid its visible name. Added an explicit account-menu label; verified in all configured devices. |

## Implemented corrections

- Profile heading/copy use theme-aware colors.
- Header/profile initials use contrasting action tokens.
- Account menu has a persistent accessible name.
- The community writing area occupies the full centre column. Guidance is secondary and compact.
- Composer/profile field groups align at the top, independent of helper text.

## Verification

- TypeScript and ESLint passed; 70 unit tests passed.
- Production build passed after the final CSS changes.
- Full UI suite passed 75 cases, with only three isolated-R2 checks skipped.
- After the final field-alignment refinement, all six affected composer/dark-profile cases passed again. The composer check asserts full writing width and aligned control tops. Profile checks cover axe before/during editing and at least 4.5:1 initials contrast.
- Security configuration and all five security headers passed.
- The separate preview's production dependency audit reports zero known advisories.

The full UI checks use the existing disposable PGlite fixture runner; native PostgreSQL verification remains a separate CI job. Screen-reader evaluation, physical mobile devices, live R2, search relevance, and production-backend acceptance are not claimed by this visual review.

No Pnyx merge, deployment, database migration, dependency change or unrelated edit was performed. Only the separately authorized private review Site may be published.
