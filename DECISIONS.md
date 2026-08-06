# Design Decisions (ADRs)

## ADR-001: Keyword retrieval before embeddings

**Decision:** Use stopword-aware term overlap scoring instead of a vector database.

**Why:**
- Deterministic results in CI without API keys or model downloads
- Auditable: a judge can see *why* a chunk scored
- Day-2 can still add embeddings behind the same `scoreChunks` boundary

**Trade-off:** Weaker semantic paraphrase matching. Mitigated by chunk overlap + optional LLM refine over retrieved evidence only.

## ADR-002: Extractive default, LLM optional

**Decision:** Default answers concatenate grounded quotes. LLM refine is opt-in via `LLM_*` env.

**Why:**
- Hackathon CI and demos must work offline of vendor quotas
- LLM is constrained to numbered evidence; Citation Auditor can veto drift

## ADR-003: Refusal threshold 0.18

**Decision:** If best chunk score `< 0.18`, refuse with zero citations. Also require ≥2 overlapping query terms when the question has ≥2 content tokens (`MIN_OVERLAP_TERMS`).

**Why:** Empirically separates seeded in-scope leave/expense questions from garbage queries in unit tests. The overlap floor stops weak single-token hits (e.g. “week” matching “per week”). Tunable in `src/lib/retrieve.ts`.

## ADR-004: Runtime Citation Auditor

**Decision:** `src/lib/faithfulness.ts` executes the Citation Auditor agent on every answer.

**Checks:**
1. Citation quotes are substrings of stored documents
2. LLM answers cannot introduce numbers absent from citations
3. Failed LLM audits fall back to extractive grounded answers

**Why:** Agent Engineering marks require agents that *shape behavior*, not only markdown role cards.

## ADR-005: File-backed demo store

**Decision:** Persist to `.data/store.json` (gitignored), not Postgres.

**Why:** Zero-ops local/CI demo. Store API is isolated for Day-2 DB swap.

## ADR-006: PDF via unpdf

**Decision:** Extract PDF text with `unpdf` on multipart upload.

**Why:** No native bindings; works in GitHub Actions. Text/markdown still supported for paste workflows.
