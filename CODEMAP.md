# Code map (read this first)

CiteGuard is intentionally small. Start here when reviewing.

## 60-second judge path (code)

1. `CODEMAP.md` (this file)
2. `DECISIONS.md` → ADR-007 (Day 2 supersession)
3. `src/lib/policy-version.ts` — current vs superseded
4. `src/lib/faithfulness.ts` → `auditCitationCurrency`
5. `src/lib/answer.ts` → `filterCurrentChunks` then retrieve → audit
6. GitHub Actions green + `e2e/citeguard.spec.ts` Day 2 test

## Ask path (happy path)

```
POST /api/ask
  → answerQuestion()              src/lib/answer.ts
      1. filterCurrentChunks()    src/lib/policy-version.ts   // currency
      2. scoreChunks()            src/lib/retrieve.ts         // retrieval
      3. build answer (extractive or optional LLM)
      4. auditAnswerFaithfulness() src/lib/faithfulness.ts    // auditor
```

If evidence is weak → refuse with zero citations.  
If a superseded doc is cited → refuse (`SUPERSEDED_REFUSAL`).

## Upload path

```
POST /api/documents
  → extract text (optional file)  src/lib/extract.ts
  → addDocument()                 src/lib/store.ts
      → chunkText()               src/lib/chunk.ts
      → derivePolicyFamily()      src/lib/policy-version.ts
```

## Day 2 supersession demo

```
POST /api/demo/day2-supersession
  → seed old (12 days / 2020) + current (22 days / 2024)  // same policyFamily
  → answerQuestion() on the SAME instance                 // Vercel-safe
```

UI: try chip **Day 2: superseded policies** → expect **22**, not 12.

## Module responsibilities (one job each)

| File | One job |
| --- | --- |
| `types.ts` | Domain types only |
| `chunk.ts` | Tokenize + overlapping chunks |
| `retrieve.ts` | Score chunks; citations; refusal threshold |
| `policy-version.ts` | Families, effective dates, current vs superseded |
| `faithfulness.ts` | Citation Auditor: quote real + citation current |
| `answer.ts` | Orchestrate currency → retrieve → answer → audit |
| `store.ts` | In-memory (+ file) docs / chunks / audit |
| `extract.ts` | Uploads (txt/md/pdf) → plain text |

## API routes

| Route | Role |
| --- | --- |
| `POST /api/ask` | Answer or refuse |
| `POST /api/documents` | Upload / paste policy |
| `GET /api/audit` | Audit list or CSV |
| `POST /api/demo/day2-supersession` | One-click Day 2 proof |
| `GET /api/health` | Liveness |

## UI

| File | One job |
| --- | --- |
| `CiteGuardApp.tsx` | State + API wiring |
| `citeguard/http.ts` | Shared fetch/error helpers |
| `citeguard/AskForm.tsx` | Question + demo chips |
| `citeguard/AnswerPanel.tsx` | Answer, banners, citations |
| `citeguard/SourcesPanel.tsx` | Upload + document list |
| `citeguard/SourcePanel.tsx` | Opened citation text |
| `citeguard/AuditPanel.tsx` | Audit trail + CSV |

## Naming conventions

- `*Result` — user-facing return shapes (`AskResult`)
- `audit*` — Citation Auditor checks (may fail an answer)
- `filterCurrent*` / `resolveCurrency` — policy currency (not HTTP cache)
- `REFUSAL` / `SUPERSEDED_REFUSAL` — fixed user-visible refuse strings
- `data-testid` — stable Playwright hooks

## Tests

- Unit: `src/lib/__tests__/` — retrieval, refusal, faithfulness, supersession
- E2E: `e2e/citeguard.spec.ts` — leave, pizza, conflict, Day 2 one-click

## Docs for panel

- Architecture: `ARCHITECTURE.md`
- Decisions: `DECISIONS.md`
- Agents/skills: `AGENTS_AND_SKILLS.md`
- Deck / Q&A: `specs/PANEL_DECK.md`, `specs/CiteGuard-Panel-QA-v2.pdf`
