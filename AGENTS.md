<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only recreates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CiteGuard Constitution

**How to read the code first:** [`CODEMAP.md`](./CODEMAP.md)

## Product

CiteGuard answers policy questions **only** from uploaded source documents and always attaches citations — or refuses.

Spec Kit constitution (canonical ADLC copy): `.specify/memory/constitution.md`

## Non-negotiables for agents

1. Do not invent policy content. Prefer refusal over speculation.
2. Keep retrieval + refusal logic testable without an LLM API key.
3. Never commit secrets (`.env`, API keys). Use `.env.example` only.
4. Prefer small commits; keep `ARCHITECTURE.md`, `CODEMAP.md`, and tests in sync with behavior changes.
5. Before claiming done: `npm run lint`, `npm run test:unit`, `npm run build`.
6. For answer-path changes, consult `agents/citation-auditor.md`.
7. For ingestion/chunking changes, follow `skills/chunk-and-index/SKILL.md`.
8. Follow the Spec Kit trail under `.specify/` when changing scope.

## Stack boundaries

- App code lives under `src/`.
- Core ask path: `answer.ts` → `policy-version.ts` + `retrieve.ts` + `faithfulness.ts`.
- E2E tests live under `e2e/`.
- CI must stay green (`.github/workflows/ci.yml`).

## Human in the loop

Propose plans, wait for approval on risky changes (auth, data deletion, dependency major bumps), and explain trade-offs briefly.
