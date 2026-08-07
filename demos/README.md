# CiteGuard demo guide (~3 minutes)

Repo: https://github.com/Siddharthye/citeguard  
Live: https://citeguard-two.vercel.app  
Release: https://github.com/Siddharthye/citeguard/releases/tag/v0.3.0  

**Walkthrough video (subtitled, ~98s):** [`citeguard-demo.mp4`](./citeguard-demo.mp4)  
Also: [`citeguard-demo.webm`](./citeguard-demo.webm)

## Screenshots (ready to submit)

Saved under `demos/`:

1. `01-home.png` — CiteGuard landing / ask UI  
2. `02-cited-answer.png` — leave question answered with **18 days** + citations  
3. `03-refusal.png` — out-of-scope question refused  
4. `04-upload-and-ask.png` — new policy uploaded and answered  
5. `05-audit-log.png` — audit trail  

## Live walkthrough script

```bash
npm run build && npm start
```

Open http://localhost:3000 and narrate:

1. **Problem** — people ask LLMs about policies and get invented answers.  
2. **Ask** — “How many days of paid annual leave do employees receive?” → show **18** + quote.  
3. **Refuse** — ask something not in the docs → “I don’t know”.  
4. **Upload** — paste a short travel policy → ask about business class → citation from new doc.  
5. **Audit / export** — scroll audit log → click **Export CSV**.  
6. **ADLC** — open GitHub: `ARCHITECTURE.md`, `AGENTS.md`, `AGENTS_AND_SKILLS.md`, green Actions, `v0.3.0`.

## Re-record

```bash
npm run build
npx playwright test -c playwright.demo.config.ts
```
