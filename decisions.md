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
