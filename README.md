# CiteGuard

**Deploy or Die · Track C — Knowledge & Compliance Agents**

Ask questions against uploaded policies. Get answers only when the documents support them — with the exact passage cited — or a clear refusal. A **runtime Citation Auditor** verifies every quote.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A sample Acme workplace policy is seeded automatically.

### Optional LLM refinement

Copy `.env.example` → `.env.local` and set OpenAI-compatible credentials (NVIDIA Build, Gemini OpenAI endpoint, OpenRouter, etc.). Without keys, CiteGuard stays in deterministic **extractive** mode (required for CI). Failed LLM drafts are vetoed by the auditor and fall back to extractive quotes.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` / `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run test:unit` | Retrieval / refusal / faithfulness tests |
| `npm run test:e2e` | Playwright (starts production server) |

## Hackathon gate artifacts

- `ARCHITECTURE.md` — stack, data model, design
- `DECISIONS.md` — ADRs / trade-offs
- `DAY2_PLAYBOOK.md` — twist response map
- `AGENTS.md` — agent constitution / rules
- `AGENTS_AND_SKILLS.md` — custom agent + skill index
- `agents/citation-auditor.md` — custom agent (executable via `faithfulness.ts`)
- `skills/chunk-and-index/SKILL.md` — custom skill
- `specs/PRD.md` — specification / user stories
- `specs/PANEL_DECK.md` — finalist deck outline
- `.github/workflows/ci.yml` — CI pipeline
- `demos/` — screenshots + short walkthrough video

## Demo tips

1. Ask: *How many days of paid annual leave do employees receive?* → expect **18** + citations → click citation → source panel.
2. Ask something unrelated → expect **I don't know**.
3. Upload a short policy (txt/md/pdf) and ask about it.
4. Show auditor meta (`auditor: pass`) and Export CSV.
5. Walk GitHub: Decisions, green Actions, `v0.2.0`.
