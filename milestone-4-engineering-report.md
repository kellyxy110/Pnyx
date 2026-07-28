# Milestone 4 engineering report

## Implemented

- Added provider-agnostic AI orchestration with Groq-compatible requests, model and policy metadata, 12-second timeouts, one retry, input limits, and safe unavailable/failure states.
- Added public-discussion summaries, tag suggestions, source/documentation search-term suggestions, and permission-aware related discussion retrieval.
- Added selected-public-discussion drafting for knowledge artifacts. Drafts remain editable and are never auto-published or marked verified.
- Added AI output persistence with provider, model, policy version, source IDs, latency, status, and output metadata.
- Added authenticated feedback, correction/report, and per-user disable controls.
- Added accessible AI assistance controls to discussion pages and AI drafting controls to the knowledge editor.
- Applied migration `20260728170000_ai_assistance` to Prisma Postgres.
- Documented `GROQ_API_KEY` and `GROQ_MODEL` in `.env.example` without any secret value.

## Verification

- Prisma validation passed.
- Prisma Client generation passed.
- Prisma migration deploy passed.
- Tests passed: 6 files, 13 tests.
- ESLint passed with no errors.
- TypeScript passed.
- Production build passed.
- `git diff --check` passed.

## Release status

`GROQ_API_KEY` is now present in Vercel Production and Preview, encrypted and verified by variable name. The provider configuration blocker is closed.

No further external action is required for Milestone 4. Do not place the key in source code, `.env.example`, or `vercel.json`.

Milestone 4 is formally closed. Milestone 5 is the next milestone.