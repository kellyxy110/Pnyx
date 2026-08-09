# Pnyx Decision Log

This file records decisions that should remain stable unless there is explicit evidence to revisit them. New decisions should include context, the choice, consequences, and a date.

## D-001 — Product identity is Pnyx

**Status:** Accepted
**Date:** 2026-07-27

Pnyx is the standalone product name. “Nexis Commons” and related names are rejected as product names for this project.

**Why:** Pnyx needs an identity that can grow across community, learning, research, collaboration, careers, and events without being tied to one parent-product naming system or one feature.

## D-002 — Pnyx is a knowledge network, not a conventional social feed

**Status:** Accepted
**Date:** 2026-07-27

The product is organized around knowledge outcomes. Social interaction is valuable, but the primary compounding loop is:

`Question → Discussion → Expert contribution → AI-assisted synthesis → Human/source verification → Knowledge artifact → Research and reuse`

**Consequence:** Feed mechanics, search, profiles, moderation, and AI should all help useful knowledge survive and become easier to find.

## D-003 — AI is an operating layer, not the product’s sole identity

**Status:** Accepted
**Date:** 2026-07-27

AI may summarize, tag, detect duplicates, connect sources, translate, recommend, and assist moderation. It must remain distinguishable from human-authored and verified material.

**Consequence:** Every generated output needs provenance, an appropriate confidence or status label, an edit path, and a report/correction path.

## D-004 — Spaces are the primary community primitive

**Status:** Accepted
**Date:** 2026-07-27

Pnyx uses Spaces for topic communities. A Space can contain posts, discussions, knowledge artifacts, events, and learning resources.

**Consequence:** Spaces should be broader and more structured than isolated subforums, with optional subtopics and clear moderation ownership.

## D-005 — Start with a modular monolith

**Status:** Accepted
**Date:** 2026-07-27

The first production architecture should be a modular monolith with explicit domain boundaries for identity, content, Spaces, knowledge, search, moderation, notifications, and AI orchestration.

**Why:** The MVP has high product uncertainty and low evidence for operational need. Service extraction can happen when load, team ownership, security isolation, or deployment cadence justifies it.

## D-006 — Trust is earned through evidence, not popularity alone

**Status:** Accepted
**Date:** 2026-07-27

Pnyx will not make a single karma score the main measure of expertise. Reputation is category-specific and based on useful answers, accepted contributions, reviews, citations, and sustained quality.

**Consequence:** Early reputation should be descriptive and transparent. Avoid leaderboard incentives until abuse and gaming patterns are understood.

## D-007 — MVP scope prioritizes the knowledge loop

**Status:** Accepted
**Date:** 2026-07-27

The MVP includes identity, Spaces, posts/discussions, basic profiles, search, AI-assisted summaries/tags/duplicate suggestions, moderation, and conversion of discussions into editable knowledge artifacts.

Jobs, marketplace, full courses, live video, advanced organization tooling, and native mobile apps are later bets.

## D-008 — Privacy and provenance are first-class data properties

**Status:** Accepted
**Date:** 2026-07-27

Visibility, authorship, source references, edits, AI generation metadata, and verification status must be modeled rather than inferred from presentation.

**Consequence:** Private and restricted material must be excluded from public search, recommendations, training/evaluation datasets, and AI context unless authorized.

## D-009 — Media storage uses a provider abstraction with Cloudflare R2 as the initial provider

**Status:** Accepted
**Date:** 2026-07-29

Pnyx stores media objects outside PostgreSQL. The application persists object keys and non-sensitive metadata only; public URLs are derived server-side. The initial provider is Cloudflare R2 through its S3-compatible API, behind `src/lib/storage.ts`.

**Consequence:** Profile, Space, discussion, and knowledge media can reuse one upload/delete contract. Upload controls stay disabled until the R2 endpoint, credentials, bucket, and public base URL are configured in the target environment.

## D-010 — Toggle counts (Join, Follow) are always server-authoritative

**Status:** Accepted
**Date:** 2026-08-05

Membership and follow mutation endpoints return the real post-mutation count from the database (`prisma.*.count()`), and the client never computes a displayed count by incrementing/decrementing local state.

**Why:** Three independent hand-rolled client implementations were each doing local `+1`/`-1` arithmetic against display counts. The database layer was already idempotent (composite primary keys, `upsert`), but the client-side arithmetic drifted from the true count under retries, races, and shared busy-state bugs across cards in a list.

**Consequence:** New toggle-style interactions should use the shared `useToggleAction` hook (`src/lib/use-toggle-action.ts`) rather than reimplementing optimistic count math.

## D-011 — Every routed page renders inside the shared `.app-shell` grid

**Status:** Accepted
**Date:** 2026-08-05

No page may define its own top-level layout wrapper in place of the shared `.app-shell` CSS Grid container.

**Why:** The discussion-detail page rendered its own `<main className="shell">` — not a real CSS class — instead of `.app-shell`, which silently broke sidebar positioning and bottom-nav-safe padding only on that route.

**Consequence:** New pages must wrap content in `.app-shell` from the start; layout regressions of this kind are a review checklist item, not just a one-off bug fix.

## D-012 — Web is named Web3 and Cryptocurrency is a first-class Space

**Status:** Accepted
**Date:** 2026-08-09

The initial Space taxonomy uses `Web3` rather than `Web`, and includes `Cryptocurrency` as a separate public Space.

**Why:** The community taxonomy should reflect the intended technology domains and make blockchain/cryptocurrency discussions discoverable without conflating them with general web development.

**Consequence:** The taxonomy is updated through Prisma seed data and the forward-only migration `20260809120000_web3_cryptocurrency_spaces`; future Space references should use the `web` and `cryptocurrency` slugs.

## D-013 — Space-originated discussions retain context

**Status:** Accepted  
**Date:** 2026-08-09

Starting a discussion from a Space opens the shared composer with that Space selected, clearly tells the author where the post will be published, and returns the author to the originating Space after publishing.

**Why:** A shared Community composer is useful for implementation reuse, but silently changing context makes Space participation feel broken and increases the risk of publishing into the wrong community.

**Consequence:** Space links may pass a Space slug and same-origin return path to `/feed`; the composer validates the return path before navigation and the existing server-side Space validation remains authoritative.

## D-014 — Motion is progressive enhancement

**Status:** Accepted  
**Date:** 2026-08-09

Pnyx uses smooth scrolling and restrained page-entry motion only when the user has not requested reduced motion. Reduced-motion users receive the same content and navigation without animation.

**Why:** Motion should provide orientation and continuity without creating an accessibility or vestibular-motion barrier.
