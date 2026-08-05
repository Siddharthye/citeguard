# Day 2 Twist Playbook

Finalists get a surprise requirement. Use this map — add, don’t rewrite.

## Where to change things

| Twist | Touch these | Keep green |
| --- | --- | --- |
| Stricter citations | `faithfulness.ts`, threshold in `retrieve.ts`, auditor tests | `npm run test:unit` |
| PDF / DOCX / HTML | `extract.ts` + `POST /api/documents` | add fixture e2e |
| Export compliance PDF | new route reading `listAudit()` / citations | extend Playwright |
| Confidence scores | attach `bestScore` on `AskResult`, show in UI | unit assert |
| Simple auth | middleware wrapper; store already isolated | smoke e2e login skip |
| Multi-doc conflict | strengthen `multiSource` + UI banner | adversarial test |
| Compare two policies | new `/api/compare` using same chunks | new e2e |
| Streaming answers | SSE over extractive path first | keep refusal sync |

## 90-minute procedure

1. Restate the twist as one acceptance test in `e2e/` or unit tests **first**.
2. Implement the smallest module behind existing boundaries (`extract`, `store`, `answer`, `faithfulness`).
3. Run `npm run lint && npm run test:unit && npm run build`.
4. Run `npm run test:e2e`.
5. Commit with message explaining the twist; push; confirm Actions green.
6. Update `ARCHITECTURE.md` + this playbook with what you did (2 bullets).

## Do not

- Rip out extractive mode for a full agent rewrite mid-twist
- Break CI by requiring paid LLM keys
- Skip faithfulness checks to “make the demo cooler”

## Panel talking points

- We designed for change: retrieval → audit → answer are separate modules
- Citation Auditor is executable in CI, not just a prompt file
- Day 2 feature lands as a new adapter, not a rewrite
