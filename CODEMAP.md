# Code map (read this first)

CiteGuard is intentionally small. Follow this path when reviewing.

## Ask path (happy path)

```
POST /api/ask
  → answerQuestion()          src/lib/answer.ts
      → filterCurrentChunks() src/lib/policy-version.ts   // currency
      → scoreChunks()         src/lib/retrieve.ts         // retrieval
      → auditAnswerFaithfulness() src/lib/faithfulness.ts // auditor
```

## Upload path

```
POST /api/documents
  → addDocument()             src/lib/store.ts
      → chunkText()           src/lib/chunk.ts
```

## Day 2 supersession demo

```
POST /api/demo/day2-supersession
  → seeds old + current leave policies (same policyFamily)
  → answerQuestion() on the same instance (Vercel-safe)
```

## Module responsibilities

| File | One job |
| --- | --- |
| `types.ts` | Domain types only |
| `chunk.ts` | Tokenize + split text into overlapping chunks |
| `retrieve.ts` | Score chunks; build citations; refusal threshold |
| `policy-version.ts` | Effective dates, families, current vs superseded |
| `faithfulness.ts` | Citation Auditor: quote real + citation current |
| `answer.ts` | Orchestrate retrieve → answer → audit |
| `store.ts` | In-memory (+ file) document / chunk / audit store |
| `extract.ts` | Turn uploads (txt/md/pdf) into plain text |

## UI

| File | One job |
| --- | --- |
| `CiteGuardApp.tsx` | State + API wiring |
| `citeguard/AskForm.tsx` | Question + demo chips |
| `citeguard/AnswerPanel.tsx` | Answer, banners, citations |
| `citeguard/SourcesPanel.tsx` | Upload + document list |
| `citeguard/AuditPanel.tsx` | Audit trail + CSV |

## Naming conventions

- `*Result` — return shapes for user-facing operations (`AskResult`)
- `audit*` — Citation Auditor checks (may fail an answer)
- `filterCurrent*` / `resolveCurrency` — policy currency, not HTTP caching
- `data-testid` — stable hooks for Playwright

## Tests

- Unit: `src/lib/__tests__/` (retrieval, refusal, faithfulness, supersession)
- E2E: `e2e/citeguard.spec.ts` (leave, pizza, conflict, Day 2 one-click)
