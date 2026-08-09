# Agents and Skills

This repo ships one custom agent and one custom skill for the Deploy or Die ADLC gate.

## Custom agent: Citation Auditor

**Path:** `agents/citation-auditor.md`

**Role:** Review CiteGuard answers before they are treated as demo-ready. The auditor checks that every claim maps to a citation quote, that refusals happen when evidence is missing, and that the audit log would show a trustworthy trail.

**When to use:** After implementing `/api/ask` changes, retrieval threshold tweaks, or LLM prompt edits.

## Custom skill: Chunk and Index

**Path:** `skills/chunk-and-index/SKILL.md`

**Role:** Reusable procedure for turning raw policy text into retrieval-ready chunks with stable IDs and document metadata — the same contract `src/lib/chunk.ts` and `src/lib/store.ts` implement.

**When to use:** Adding parsers (PDF, DOCX), changing chunk size/overlap, or preparing fixtures for Playwright.

## How agents should load these

1. Read `AGENTS.md` (project constitution).
2. For answer-quality work, open `agents/citation-auditor.md`.
3. For ingestion/retrieval work, open `skills/chunk-and-index/SKILL.md`.
4. Prefer small, reviewed diffs; keep CI green.

## Mapping to product code

| Artifact | Runtime counterpart |
| --- | --- |
| Citation Auditor | `src/lib/faithfulness.ts` + currency via `policy-version.ts` + veto in `answer.ts` + unit tests |
| Chunk and Index skill | `src/lib/chunk.ts`, `addDocument()` in `store.ts`, `extract.ts` for PDF |
