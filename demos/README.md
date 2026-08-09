# CiteGuard demo guide (~3 minutes)

Repo: https://github.com/Siddharthye/citeguard  
Live: https://citeguard-two.vercel.app  
Release: https://github.com/Siddharthye/citeguard/releases/tag/v0.4.0  

**Walkthrough video (subtitled, ~98s):** [`citeguard-demo.mp4`](./citeguard-demo.mp4)

**Panel pack:** [`CiteGuard-Panel-Day2.pptx`](./CiteGuard-Panel-Day2.pptx) · [`CiteGuard-Panel-QA.pdf`](./CiteGuard-Panel-QA.pdf) · [`CiteGuard-Simple-Walkthrough.pdf`](./CiteGuard-Simple-Walkthrough.pdf)  
(Canonical copies also under `specs/` as `CiteGuard-Panel-Day2-v2.pptx` + the same PDFs.)

## Screenshots (ready to submit)

Saved under `demos/`:

1. `01-home.png` — CiteGuard landing / ask UI  
2. `02-cited-answer.png` — leave question answered with **18 days** + citations  
3. `03-refusal.png` — out-of-scope question refused  
4. `04-upload-and-ask.png` — new policy uploaded and answered  
5. `05-audit-log.png` — audit trail  
6. `06-day2-supersession.png` — Day 2: current leave = **22**, superseded banner + badges  

## Live walkthrough script

```bash
npm run build && npm start
```

Open http://localhost:3000 and narrate:

1. **Problem** — people ask LLMs about policies and get invented answers.  
2. **Ask** — “How many days of paid annual leave do employees receive?” → show **18** + quote.  
3. **Refuse** — ask something not in the docs → “I don’t know”.  
4. **Day 2** — click **Day 2: superseded policies** → **22** (not 12), citations from 2024, superseded banner + badges.  
5. **Upload** — paste a short travel policy → ask about business class → citation from new doc.  
6. **Audit / export** — scroll audit log → click **Export CSV**.  
7. **ADLC** — open GitHub: `CODEMAP.md`, `ARCHITECTURE.md`, `AGENTS.md`, green Actions, `v0.4.0`.

## Re-record

```bash
npm run build
npx playwright test -c playwright.demo.config.ts
```
