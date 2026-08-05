# CiteGuard

**Deploy or Die · Track C — Knowledge & Compliance Agents**

Ask questions against uploaded policies. Get answers only when the documents support them — with the exact passage cited — or a clear refusal. A **runtime Citation Auditor** verifies every quote.

## Clone → run in ~60 seconds

### Option A — npm (fastest)

```bash
git clone https://github.com/Siddharthye/citeguard.git
cd citeguard
npm install
npm run build && npm start
```

Open **http://localhost:3000** — sample Acme policy is seeded. Ask: *How many days of paid annual leave do employees receive?*

### Option B — Docker (one command)

```bash
git clone https://github.com/Siddharthye/citeguard.git
cd citeguard
docker compose up --build
```

Same URL: **http://localhost:3000**

### Dev mode

```bash
npm install
npm run dev
```

### Optional LLM refinement

Copy `.env.example` → `.env.local` and set OpenAI-compatible credentials (NVIDIA / Gemini / OpenRouter). Without keys, extractive mode runs (CI default). Auditor vetoes ungrounded LLM numbers.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` / `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run test:unit` | Retrieval / refusal / faithfulness tests |
| `npm run test:e2e` | Playwright |
| `docker compose up --build` | Containerized production app |

Pre-commit hooks run `lint` + `test:unit` via Husky after `npm install`.

## ADLC / Spec Kit trail

Organizer-aligned Spec Kit artifacts live under [`.specify/`](.specify/README.md):

- Constitution → `.specify/memory/constitution.md`
- Spec / plan / tasks / analyze → `.specify/specs/001-citeguard/`

Also: `ARCHITECTURE.md`, `DECISIONS.md`, `DAY2_PLAYBOOK.md`, `AGENTS.md`, `AGENTS_AND_SKILLS.md`.

## Hackathon gate artifacts

- Architecture, agent rules, working app, custom agent + skill, green CI
- `agents/citation-auditor.md` (executable via `src/lib/faithfulness.ts`)
- `skills/chunk-and-index/SKILL.md`
- `demos/` screenshots + walkthrough video
- Releases: `v0.3.0`+

## Demo tips

1. Leave question → **18** + citations → click citation → source panel.
2. Out-of-scope → **I don't know**.
3. Upload two conflicting leave policies → **conflict banner**.
4. PDF or txt upload → ask → Export CSV.
5. Repo walk: `.specify/` → Decisions → green Actions.
