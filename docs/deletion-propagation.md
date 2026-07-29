# Deletion propagation report

## Schema evidence

Prisma relations cascade user-owned identity, Spaces membership/follows, posts, replies, artifacts, revisions, contributors, sources, reports, appeals, notifications, reactions, bookmarks, AI feedback, tokens, and audit relations as defined in `prisma/schema.prisma`. Post deletion is intentionally soft-delete based so moderation history remains recoverable.

## Required regression scenarios

- Delete a user and verify owned content, tokens, notifications, memberships, follows, reactions, bookmarks, and AI feedback are removed.
- Soft-delete a post and verify it is absent from feeds, search, APIs, public pages, AI retrieval, and related-content results.
- Delete a reply and verify thread rendering and artifact source links remain safe.
- Delete a Space and verify posts, artifacts, mutes, memberships, and search results follow the documented policy.
- Verify uploaded assets and external caches are removed or invalidated where applicable.

## Current status

Schema review is complete. End-to-end execution against an isolated database is pending and must not be run against production without explicit operational approval.

