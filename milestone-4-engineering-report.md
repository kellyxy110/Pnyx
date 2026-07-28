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

## Release blocker

Milestone 4 cannot be signed off under the strict Definition of Done yet. Vercel Production and Preview do not contain a `GROQ_API_KEY` variable by name, so deployed generation will correctly return an explicit unavailable state rather than fabricate content. The repository implementation is complete and safe, but the live provider-backed AI path is not operational until the project owner adds the key.

Required external action: in Vercel project `kellyxys-projects/pnyx`, add `GROQ_API_KEY` to both Production and Preview under Project Settings → Environment Variables, then redeploy `main`. Do not place the key in source code, `.env.example`, or `vercel.json`.

Milestone 5 must not begin until this provider configuration is verified and production AI smoke tests return a generated result with stored provenance.