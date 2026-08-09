# CiteGuard Architecture

**Start with the code map:** [`CODEMAP.md`](./CODEMAP.md) (ask path, modules, judge reading order).

## Purpose

CiteGuard is a Track C (Knowledge & Compliance) application: users upload policy documents, ask questions, and receive answers that are grounded in source passages. If evidence is weak, the system refuses instead of inventing an answer. Every Q&A is written to an audit log.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | Next.js 16 App Router + React 19 | Fast demo surface, first-class API routes |
| Language | TypeScript | Safer agent-assisted iteration |
| Styling | Tailwind CSS v4 | Rapid, consistent layout |
| Retrieval | In-process chunking + term overlap scoring | Deterministic, no vector DB required for CI |
| Optional LLM | OpenAI-compatible chat API (`LLM_*` env) | NVIDIA / Gemini / OpenRouter when keys exist |
| Tests | Node test runner + Playwright | Unit + browser verification in CI |
| CI | GitHub Actions | Gate requirement: green pipeline |

## High-level design

```text
Browser (CiteGuard UI)
    │
    ├── POST /api/documents  → store + chunk text
    ├── GET  /api/documents  → list sources
    ├── POST /api/ask        → retrieve → answer/refuse → audit
    ├── GET  /api/audit      → recent Q&A trail
    └── GET  /api/health     → liveness
```

## Data model

- **Document**: `{ id, name, content, uploadedAt, effectiveDate, version?, policyFamily }`
- **Chunk**: `{ id, documentId, documentName, index, text }` — overlapping windows (~500 chars)
- **Citation**: `{ documentId, documentName, chunkId, chunkIndex, quote, score }`
- **AskResult**: `{ answer, refused, citations[], mode, faithful, auditIssues, multiSource, superseded[] }`
- **AuditEntry**: `{ id, question, answer, refused, citationCount, createdAt }`

Storage uses an in-process singleton (`src/lib/store.ts`) backed by best-effort persistence to `.data/store.json` so local demos survive restarts. A sample Acme workplace policy is seeded on first access so the app is immediately demoable. Audit history can be exported via `GET /api/audit?format=csv`.

## Answer path

1. Tokenize the question (stopword-aware).
2. Resolve **policy currency** per `policyFamily` (latest `effectiveDate` ≤ today is current).
3. Score only chunks from **currently effective** documents.
4. If best score `< 0.18`, or fewer than 2 query terms overlap (when the question has ≥2 tokens), refuse with a fixed “I don’t know…” message and zero citations.
5. Otherwise take top citations and:
   - **Extractive mode (default):** compose the answer from cited quotes (CI-safe, no API key).
   - **LLM mode (optional):** if `LLM_API_KEY` + `LLM_BASE_URL` are set, ask the model to answer *only* from numbered evidence passages.
6. Append an explicit note when superseded versions of the same family exist.
7. **Citation Auditor (runtime):** `faithfulness.ts` verifies quotes ⊆ documents, rejects uncited LLM numbers, and **rejects citations from superseded policies** (falls back / refuses).

## Extensibility (Day 2 ready)

See `DAY2_PLAYBOOK.md` and `DECISIONS.md`. Designed so surprise requirements land as additive modules:

- New document types → `extract.ts` parsers feeding `addDocument`
- Stricter citation rules → `faithfulness.ts` / refusal threshold
- **Superseded policies (shipped Day 2)** → `policy-version.ts` + currency auditor
- Export / compliance report → audit log + CSV (extendable)
- Auth / multi-tenant → wrap store behind an interface (isolated in `store.ts`)

## Key modules

- `src/lib/chunk.ts` — tokenization + chunking
- `src/lib/retrieve.ts` — scoring + refusal threshold
- `src/lib/policy-version.ts` — effective dates, family, supersession
- `src/lib/faithfulness.ts` — executable Citation Auditor (faithfulness + currency)
- `src/lib/extract.ts` — txt/md/pdf text extraction
- `src/lib/answer.ts` — extractive / LLM answering + auditor veto
- `src/lib/store.ts` — documents, chunks, audit
- `src/components/CiteGuardApp.tsx` — UI shell (state + wiring)
- `src/components/citeguard/*` — Ask / Answer / Source / Sources / Audit panels
