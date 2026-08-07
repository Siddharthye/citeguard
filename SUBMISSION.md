# Day 1 submission (Deploy or Die)

**Track:** C — Knowledge & Compliance Agents  
**Product:** CiteGuard  
**Repo:** https://github.com/Siddharthye/citeguard  
**Live demo:** https://citeguard-two.vercel.app  
**Latest release:** https://github.com/Siddharthye/citeguard/releases/tag/v0.3.0  
**CI:** GitHub Actions on `master` — latest runs **green**  
https://github.com/Siddharthye/citeguard/actions

## Demo assets

- Screenshots: [`demos/`](./demos/) (`01-home.png` … `05-audit-log.png`)
- Walkthrough video (subtitled): [`demos/citeguard-demo.mp4`](./demos/citeguard-demo.mp4) · [`demos/citeguard-demo.webm`](./demos/citeguard-demo.webm)
- Script: [`demos/README.md`](./demos/README.md)

## Gate checklist

| Checkpoint | Location |
| --- | --- |
| Architecture | `ARCHITECTURE.md` |
| Agent rules | `AGENTS.md`, `.specify/memory/constitution.md` |
| Working app | Vercel / `npm start` / `docker compose up` |
| Custom agent + skill | `agents/citation-auditor.md`, `skills/chunk-and-index/SKILL.md`, `AGENTS_AND_SKILLS.md` |
| Green CI | `.github/workflows/ci.yml` |

## 60-second judge path

1. Open live demo → ask leave days → expect **18** + citations.  
2. Ask cafeteria pizza / out-of-scope → expect refusal.  
3. Optional: upload two conflicting leave policies → conflict banner.  
4. Repo: `.specify/` → `DECISIONS.md` → green Actions → `demos/`.

**Note:** On Vercel, audit CSV may look empty across cold instances (serverless memory). Use local/`docker compose` for a guaranteed audit trail demo; the export endpoint itself is green in CI Playwright.
