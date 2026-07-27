# Pnyx Product Requirements Document

**Status:** Product foundation  
**Version:** 0.1  
**Date:** 2026-07-27

## 1. Vision

> Pnyx is where technology conversations become organised knowledge.

Pnyx will become a trusted home for technology community, learning, research, collaboration, careers, and events. It is a knowledge network: discussion is the beginning, and durable understanding is the outcome.

## 2. Problem

Technology knowledge is distributed across fast-moving feeds, forums, documentation, repositories, videos, papers, and private chats. Useful answers are repeated, context disappears, expertise is difficult to evaluate, and AI-generated information is often detached from sources or verification.

Pnyx should help people ask better questions, find the right people and sources, participate meaningfully, and turn valuable exchanges into reusable knowledge.

## 3. Target users

- Learners who need approachable explanations and trusted paths through a topic.
- Engineers and builders who need practical answers, peers, code context, and collaborators.
- Researchers and technical writers who publish experiments, benchmarks, guides, and citations.
- Designers, product managers, founders, and educators who need cross-disciplinary expertise.
- Open-source maintainers and organisations that need to explain work, answer questions, and find contributors.

## 4. Product principles

Knowledge over noise; human expertise with AI assistance; transparent trust; beginner-to-expert accessibility; durable, linkable outputs; privacy and safety by default.

## 5. Information architecture

- **Home:** personalized feed combining followed Spaces, people, and knowledge artifacts.
- **Spaces:** topic communities with posts, discussions, artifacts, resources, and moderators.
- **Explore/Search:** keyword and semantic discovery across public content, with filters for type, Space, author, date, and verification status.
- **Knowledge:** guides, answers, research, benchmarks, case studies, and learning resources.
- **Profile:** identity, bio, expertise categories, contributions, authored artifacts, and activity controls.
- **Inbox/Notifications:** mentions, replies, follows, moderation outcomes, and collaboration requests.
- **Organisations:** verified pages for companies, projects, institutions, and open-source communities.
- **Future surfaces:** collaboration, careers, events, messaging, APIs, and marketplace.

## 6. MVP requirements

### Identity and profiles

- Sign up, sign in, sign out, account recovery, and basic profile editing.
- Username, display name, bio, avatar, location/time zone (optional), expertise categories, and links.
- Follow/unfollow Spaces and users.
- Privacy controls for profile and activity visibility.

### Spaces

- Browse, search, join, follow, and leave Spaces.
- Space description, rules, moderators, related Spaces, and featured knowledge.
- Initial seed Spaces: AI, Programming, Web, Mobile, Cloud, Data, Cybersecurity, Design, Business, Education, and Hardware.
- Moderators can configure rules, tags, pinned resources, and basic moderation actions.

### Posts and discussions

- Create, edit, delete, report, save, and share posts.
- Markdown, syntax-highlighted code blocks, links, images, polls, and supported embeds.
- Threaded replies, mentions, reactions, sorting, pagination, and accepted answer state.
- Drafts and clear visibility states: public, Space-only, followers-only, or private draft.
- Post types: question, discussion, showcase, tutorial, research, announcement, and poll.

### Knowledge artifacts

- Convert a discussion or answer into an editable article/guide with attribution.
- Author can add sources, code, diagrams, related Spaces, and revision notes.
- Artifact status: draft, published, community-reviewed, or verified.
- Preserve links to the originating discussion and contributing authors.

### AI assistance

- Generate an optional post summary and suggested tags.
- Suggest duplicate or related discussions before and after publishing.
- Extract references and suggest relevant documentation or repositories where sources are available.
- Provide article drafting assistance from selected public discussion content.
- Label generated content, retain generation metadata, allow correction, and never auto-publish as verified.

### Search and discovery

- Search public posts, users, Spaces, and knowledge artifacts.
- Keyword search in MVP; semantic retrieval may be layered in behind the same interface.
- Ranking must balance relevance, freshness, quality signals, diversity, and safety.
- Exclude private, blocked, deleted, and moderation-restricted content.

### Trust and safety

- Report content/users, block users, mute topics, and appeal moderation decisions.
- Spam, abuse, harassment, impersonation, and unsafe-content controls.
- Audit log for moderator actions and visible status for reported AI artifacts.
- Rate limits and anti-automation controls on account, posting, voting, and messaging actions.

## 7. Success measures

The first release should validate the knowledge loop, not raw registration volume.

- Time to first useful answer for a new question.
- Percentage of questions receiving a useful human contribution.
- Percentage of active discussions that produce a saved, linked, or published knowledge artifact.
- Search success: users finding and engaging with a relevant result.
- Returning contributors and the share of activity from substantive contributions.
- AI suggestion acceptance/correction rate and reported-hallucination rate.
- Reports per active user, moderation response time, and repeat-abuse rate.
- Core performance, accessibility, privacy, and reliability targets agreed before launch.

## 8. Non-goals for MVP

Full job marketplace, paid courses, native mobile apps, live video, complex organization recruiting suites, global reputation rankings, cryptocurrency/token incentives, and a distributed microservice architecture.

## 9. Roadmap

### Phase 0 — Foundation

Domain model, authentication, permissions, content policy, moderation model, observability, design system, and seeded Spaces.

### Phase 1 — MVP knowledge loop

Profiles, Spaces, posts, discussions, search, summaries, tags, duplicate suggestions, moderation, and knowledge artifact conversion.

### Phase 2 — Beta depth

Semantic search, source-aware recommendations, richer embeds, learning collections, event pages, collaboration requests, and improved reputation evidence.

### Phase 3 — Public launch

Organisation pages, research publishing, multilingual support, public APIs, analytics, creator/maintainer tools, and scalable discovery.

### Phase 4 — Expansion

Careers, jobs, courses, marketplace, native mobile clients, enterprise communities, and global localization.

## 10. Risks and mitigations

- **Low-quality volume:** contribution incentives, moderation, ranking diversity, and artifact workflows.
- **AI misinformation:** source links, status labels, human review, correction history, and conservative automation.
- **Empty community problem:** launch with a small number of well-supported Spaces and seeded high-quality resources.
- **Expert capture or elitism:** onboarding, beginner-friendly formats, transparent expertise evidence, and inclusive moderation.
- **Scope sprawl:** roadmap gates tied to evidence from the core knowledge loop.
- **Privacy leakage:** explicit visibility policies, authorization-aware retrieval, deletion propagation, and auditability.
