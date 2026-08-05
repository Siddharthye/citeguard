# Plan: CiteGuard

## Architecture

```text
UI → /api/documents (extract+store)
   → /api/ask (retrieve → answer → faithfulness audit)
   → /api/audit (JSON/CSV)
```

## Tech choices

| Choice | Rationale |
| --- | --- |
| Next.js App Router | Fast demo + API colocated |
| Keyword retrieval | Deterministic CI (ADR-001) |
| Optional OpenAI-compatible LLM | Refine only over evidence |
| unpdf | PDF text without native deps |
| Playwright + node:test | Gate + scoring tests |
| Docker standalone | One-command run for judges |

## Delivery slices

1. Core retrieve/refuse + UI
2. Auditor + PDF + source jump
3. Spec trail + Docker + conflict banner + hooks

## Risks

- Keyword miss on paraphrases → mitigate with chunk overlap + optional LLM
- LLM drift → auditor veto to extractive
- Day 2 surprise → `DAY2_PLAYBOOK.md` module map
