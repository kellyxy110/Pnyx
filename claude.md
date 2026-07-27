# Pnyx — Claude Code Guidance

## Project identity

Pnyx is a technology knowledge network where conversations become organised, durable knowledge.

Pnyx is the product name. Do not use “Nexis Commons”, “NexisHub Community”, or another placeholder name in product copy, interfaces, routes, metadata, or documentation unless explicitly discussing naming history.

Core positioning:

> Pnyx is where technology conversations become organised knowledge.

Pnyx is not only an AI-visibility product, a traditional forum, or a general-purpose social network. It combines community, learning, research, collaboration, careers, and events around technology.

## Product principles

1. Knowledge over noise. Preserve useful contributions and make them discoverable.
2. Conversation is the input, not the final product. Strong discussions should be able to become summaries, answers, guides, and research.
3. AI assists understanding; people own expertise, judgment, and verification.
4. Every feature should earn its complexity by improving learning, contribution, or discovery.
5. Trust is explicit. Show provenance, authorship, expertise, moderation, and confidence.
6. Build a welcoming home for beginners and experts without flattening either experience.
7. Accessibility, privacy, safety, and performance are product requirements, not polish.

## Working rules

- Read `decisions.md`, `prd.md`, `design.md`, and `tasks.md` before making a consequential product or architecture change.
- Treat `prd.md` as the product contract and `decisions.md` as the record of durable choices. If implementation reveals a conflict, update the decision record rather than silently changing direction.
- Keep the first release focused. Do not build jobs, a marketplace, complex reputation, live video, or a microservice fleet before the MVP proves the core knowledge loop.
- Prefer boring, observable, replaceable infrastructure. Start as a modular monolith unless scale or isolation requirements create a specific need for a service boundary.
- Keep AI outputs attributable and editable. Never present generated summaries or tags as verified facts without a human or source-backed verification state.
- Never expose private content in search, recommendations, embeddings, analytics, or AI context without explicit authorization.
- Use progressive disclosure: the feed should be approachable, while deep technical context remains available through articles, sources, code, diagrams, and discussion history.

## Core terminology

- **Space**: a community organized around a technology, discipline, or topic, such as Python, AI Agents, or Product Management.
- **Post**: the starting contribution; it may contain text, code, media, links, polls, or an embedded artifact.
- **Discussion**: the replies and structured conversation around a post.
- **Knowledge artifact**: a durable summary, answer, guide, tutorial, research note, benchmark, or case study derived from or published independently of discussion.
- **Contribution**: an authored action that improves a discussion or artifact, including an answer, edit, citation, review, or verification.
- **Knowledge reputation**: category-specific evidence of useful contribution, not a single global popularity score.
- **Organisation**: a verified company, project, institution, or open-source community page.

## Preferred implementation approach

- Use typed interfaces at boundaries and validate user-controlled input.
- Keep domain logic separate from presentation and provider-specific AI/search code.
- Design AI features behind replaceable interfaces so model providers can change without rewriting product logic.
- Store source references and generation metadata for every durable AI-assisted artifact.
- Build moderation, reporting, rate limits, audit logs, and permission checks alongside the relevant feature.
- Add tests for permissions, privacy boundaries, state transitions, and failure cases—not only happy-path rendering.
- Prefer semantic HTML, keyboard operation, visible focus, reduced-motion support, readable contrast, and responsive layouts.

## Definition of done

A feature is not done until it has:

- a clear user value and an owner in the PRD;
- permission and privacy behavior defined;
- loading, empty, error, and success states;
- accessible interaction and responsive behavior;
- analytics events only where they serve a product question;
- tests appropriate to its risk;
- moderation and abuse considerations;
- documentation updated when behavior or decisions change.

## Naming and tone

Use “Pnyx” as a proper noun. The tone is thoughtful, technical, welcoming, and curious. Avoid hype such as “revolutionary”, “the future of everything”, or claims that AI is authoritative. Explain difficult ideas clearly and respect the reader’s level of expertise.
