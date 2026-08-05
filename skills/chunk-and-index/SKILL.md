---
name: chunk-and-index
description: Turn raw policy text into overlapping retrieval chunks with stable IDs for CiteGuard.
---

# Skill: Chunk and Index

## Purpose

Prepare documents so CiteGuard can retrieve quotes and refuse weak matches.

## Steps

1. Normalize text (`\r\n` → `\n`, trim).
2. Split into ~500 character chunks with ~80 character overlap.
3. Prefer breaking on paragraph or sentence boundaries when near the window end.
4. Assign `id = {documentId}-{index}`, keep `documentName` on every chunk.
5. Replace prior chunks for that document id when re-indexing.
6. Smoke-test with one in-scope and one out-of-scope question.

## Acceptance

- In-scope question yields `refused: false` and ≥1 citation.
- Nonsense question yields `refused: true` and empty citations.
- Chunk list is non-empty for non-empty documents.

## Code anchors

- `src/lib/chunk.ts`
- `src/lib/store.ts` → `addDocument`
- `src/lib/retrieve.ts` → `REFUSAL_THRESHOLD`
