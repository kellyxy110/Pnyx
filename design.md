# Pnyx Design Direction

## Product character

Pnyx should feel like a thoughtful public square with a well-kept library behind it: lively enough for daily participation, structured enough that important ideas do not vanish.

Keywords: clear, technical, warm, credible, curious, calm, useful.

Avoid: noisy gamification, generic “AI dashboard” aesthetics, dark-pattern engagement, excessive gradients, anonymous-looking content, and UI that makes generated text look authoritative.

## Experience principles

1. Make the next useful action obvious: ask, answer, learn, save, cite, or follow.
2. Keep context near the claim. Show Space, author, timestamp, sources, status, and related discussion without forcing a separate hunt.
3. Separate conversation from durable knowledge visually and semantically.
4. Let experts go deep without making beginners feel unwelcome.
5. Use AI as a quiet assistant. Generated material should be clearly labeled but not visually dominant.
6. Design for scanning first, then depth: strong headings, summaries, code treatment, citations, and progressive disclosure.

## Core surfaces

### Home

Three useful entry points: “For you”, “Following”, and “Latest”. A compact composer asks what the user wants to contribute and suggests a post type. Cards show Space, author, contribution type, summary, discussion activity, and trust/source status.

### Space

Space header with purpose, rules, moderators, and follow action. Tabs: Discussions, Knowledge, Research, Events, and About. Featured resources should be curated and explain why they are featured.

### Discussion

Question or topic at the top, followed by an AI summary panel only when available and collapsed by default when it adds noise. Human answers, accepted answer, citations, related discussions, and conversion to knowledge artifact are first-class actions.

### Knowledge artifact

Reading-focused layout with title, abstract/summary, author and contributors, verification status, last reviewed date, sources, revision history, related discussions, and relevant Spaces. Avoid hiding attribution behind an AI label.

### Profile

Identity first, then expertise evidence: categories, useful answers, authored artifacts, reviews, and projects. Use descriptive signals rather than a prominent vanity score.

### Search

Search field with type, Space, author, date, and status filters. Result cards should expose why a result matches and whether it is a discussion, answer, guide, or research artifact.

## Visual system

- Use a restrained neutral base with one recognizable Pnyx accent color and semantic colors for success, warning, danger, and AI-assist states.
- Prefer generous spacing, readable line lengths, and clear content hierarchy over dense dashboards.
- Use one primary typeface family with a strong text scale; use a monospace face only for code and technical identifiers.
- Cards should group content, not turn every interaction into a floating container. Use borders and surface changes sparingly.
- Status labels must be text plus color/icon; never rely on color alone.
- Code, citations, diagrams, and embedded artifacts need dedicated treatments rather than being flattened into plain text.

## Interaction states

Every significant surface must design loading, empty, error, permission-denied, deleted, reported, and success states. AI actions additionally need unavailable, generating, generated, corrected, and source-not-found states.

## Accessibility baseline

- Keyboard-accessible navigation, menus, dialogs, editors, tabs, and embedded controls.
- Visible focus and logical heading structure.
- Screen-reader labels for icon actions and live updates for generation/moderation status.
- WCAG 2.2 AA contrast target and support for text resizing.
- Reduced-motion mode and no essential information conveyed by color, hover, or animation alone.
- Mobile-first layouts that support narrow screens without hiding core contribution or reading actions.

## Trust patterns

Use explicit labels such as “AI-assisted summary”, “Community-reviewed”, “Verified source”, and “Author edited”. Show source links, contributor names, review dates, and revision history where relevant. A generated answer must never visually resemble an official verified answer by default.

## Responsive priorities

On mobile, prioritize reading, replying, searching, saving, and reporting. Collapse secondary metadata into accessible disclosure. Keep composer, Space context, and source status visible. Desktop may add a related-content rail and moderation/context panels.

## Content voice

Use plain, precise language. Empty states should teach the user what belongs here. AI copy should say what it did and what it did not verify. Error messages should explain recovery without blaming the user.
