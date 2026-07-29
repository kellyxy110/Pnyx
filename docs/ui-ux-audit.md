# Pnyx authenticated product UI/UX audit

Updated: 2026-07-29
Scope: authenticated product routes at `https://pnyx-psi.vercel.app` and the corresponding route components.

## Shared shell

### What is working

- Shared header, left navigation, responsive mobile navigation, session menu, search field, theme toggle, notification count, and desktop contextual rail exist.
- The grid collapses from three columns to two columns below 1100px and to a mobile layout below 760px.
- The shell uses semantic header, navigation, complementary navigation, and skip-link landmarks.

### Gaps to address

- Navigation does not yet indicate the active route.
- The left rail omits Saved and Drafts even though persisted bookmarks and drafts exist; there are no dedicated usable routes yet, so they must not be added as dead links.
- The right rail is generic rather than contextual per route.
- Create controls should route directly to the composer only where that action is available to the viewer.

## Route-by-route findings

| Route | Current strength | UI/UX work still required |
| --- | --- | --- |
| `/feed` | Real persisted feed, composer, drafts and loading/empty/error states. | Improve feed hierarchy, contextual rail, filters, author context and active tab treatment. |
| `/posts/[id]` | Real edit/delete, reply, nested reply, like/save, share, report and accepted-answer controls. | Add readable Markdown/code treatment, limited thread connectors, reply edit/delete APIs/UI, richer contextual detail rail. |
| `/spaces` | Real persisted Space listing and membership APIs. | Reorganise discovery, add useful filters and activity context; do not add a nonexistent Space detail route. |
| `/knowledge` | Separate knowledge browser and persisted artifacts. | Improve reading-focused hierarchy and distinguish cards from feed cards. |
| `/knowledge/[id]` | Real artifact and source/revision data. | Improve long-form typography, table of contents, related-content context and mobile reading layout. |
| `/explore` | Real database-backed search entry surface. | Separate intent search from discovery sections and improve filter/result layout. |
| `/ai` | Supported AI action surface. | Keep unsupported interactions hidden; clarify sources, generated status and failure states. |
| `/profile` | Persisted profile editing, activity, social links, privacy and user network. | Add completion indicator and a more intentional first-time OAuth completion state. Storage controls correctly remain hidden until R2 is configured. |
| `/people/[username]` | Privacy-aware public identity and follow action. | Add a coherent profile information hierarchy and owner/non-owner contextual actions. |
| `/notifications` | Persisted unread/read operations. | Group notifications by time and improve content context. |
| `/moderation` | Protected operational queue. | Keep functional route but refine information density after core community journeys. |

## Truthfulness constraints

- Email/password sign-up is intentionally feature-gated. OAuth remains the beta entry path and must continue to provision a local `User` record.
- Cloudflare R2 is not configured in production, so image upload controls remain hidden. No UI may imply uploads persist until production storage configuration is verified.
- There is no public Space detail route or Settings route in the current route inventory. The UI must not expose these as working destinations until they exist.

## Implementation order

1. Shared shell active-state and contextual-rail architecture.
2. Feed/composer visual hierarchy and discussion reading experience.
3. Space browse and detail journey.
4. Profile completion and public profile polish.
5. Knowledge index/detail reading UX.
6. Explore/search, notifications and AI consistency pass.
7. Responsive and accessible browser evidence.
