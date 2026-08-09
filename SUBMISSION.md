# Day 1 submission (Deploy or Die)

**Track:** C — Knowledge & Compliance Agents  
**Product:** CiteGuard  
**Repo:** https://github.com/Siddharthye/citeguard  
**Live demo:** https://citeguard-two.vercel.app  
**Latest release:** https://github.com/Siddharthye/citeguard/releases/tag/v0.3.0  
**CI:** GitHub Actions on `master` — **green**  
https://github.com/Siddharthye/citeguard/actions  
**Playwright:** included in CI (`npm run test:e2e`)

## Judge: try this

1. Open https://citeguard-two.vercel.app  
2. **Paid leave** → click **Paid leave days** → expect **18** + citations → open a citation (real source).  
3. **Pizza refuse** → click **Cafeteria pizza (refuse)** → expect **I don't know** (no fake citations).  
4. **Day 2 — superseded policies:** upload old + new leave policy with the **same policy family** and different **effective dates** (e.g. 12 days / 2020 vs 22 days / 2024) → ask leave days → expect **22**, citations from the new doc, and an explicit **superseded** note for the old one.  
5. Repo skim: `ARCHITECTURE.md` → `AGENTS_AND_SKILLS.md` → green Actions → `demos/citeguard-demo.mp4`


## Demo assets

- Screenshots: [`demos/`](./demos/) (`01-home.png` … `05-audit-log.png`)
- Walkthrough video (subtitled): [`demos/citeguard-demo.mp4`](./demos/citeguard-demo.mp4)
- Script: [`demos/README.md`](./demos/README.md)

## Gate checklist

| Checkpoint | Location |
| --- | --- |
| Architecture | `ARCHITECTURE.md` |
| Agent rules | `AGENTS.md`, `.specify/memory/constitution.md` |
| Working app | Vercel / `npm start` / `docker compose up` |
| Custom agent + skill | `agents/citation-auditor.md`, `skills/chunk-and-index/SKILL.md`, `AGENTS_AND_SKILLS.md` |
| Green CI | `.github/workflows/ci.yml` |

## Note

On Vercel, audit CSV may look empty across cold instances (serverless memory). Use local/`docker compose` for a guaranteed audit trail; export itself is green in CI Playwright.
