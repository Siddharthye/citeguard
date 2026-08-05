# CiteGuard

**Deploy or Die · Track C — Knowledge & Compliance Agents**

Ask questions against uploaded policies. Get answers only when the documents support them — with the exact passage cited — or a clear refusal.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A sample Acme workplace policy is seeded automatically.

### Optional LLM refinement

Copy `.env.example` → `.env.local` and set OpenAI-compatible credentials (NVIDIA Build, Gemini OpenAI endpoint, OpenRouter, etc.). Without keys, CiteGuard stays in deterministic **extractive** mode (required for CI).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` / `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run test:unit` | Retrieval / refusal unit tests |
| `npm run test:e2e` | Playwright (starts production server) |

## Hackathon gate artifacts

- `ARCHITECTURE.md` — stack, data model, design
- `AGENTS.md` — agent constitution / rules
- `AGENTS_AND_SKILLS.md` — custom agent + skill index
- `agents/citation-auditor.md` — custom agent
- `skills/chunk-and-index/SKILL.md` — custom skill
- `specs/PRD.md` — specification / user stories
- `.github/workflows/ci.yml` — CI pipeline

## Demo tips

1. Ask: *How many days of paid annual leave do employees receive?* → expect **18** + citations.
2. Ask something unrelated → expect **I don't know**.
3. Upload a short policy snippet and ask about it.
4. Show the audit log.
