# Panel walk script (~90 seconds live + repo)

**Printables:** [`CiteGuard-Simple-Walkthrough.pdf`](./CiteGuard-Simple-Walkthrough.pdf) (plain language) · [`CiteGuard-Panel-QA.pdf`](./CiteGuard-Panel-QA.pdf) (judge Q&A bank) · Deck: [`CiteGuard-Panel-Day2-v2.pptx`](./CiteGuard-Panel-Day2-v2.pptx)

## Live demo (90 seconds)

1. Open https://citeguard-two.vercel.app  
2. **Paid leave days** → expect **18** + citations → open a citation.  
3. **Cafeteria pizza (refuse)** → **I don’t know**.  
4. Click **Day 2: superseded policies** → wait for seed → **Ask**  
   - Expect **22** (not 12)  
   - Citations = `leave-policy-2024.md`  
   - Banner: superseded `leave-policy-2020.md`  
   - Sources list shows **current** / **superseded** badges  

## Panel walk (2 minutes)

| Say | Open |
| --- | --- |
| How to read the code | `CODEMAP.md` |
| Constitution | `AGENTS.md` |
| Custom agent + skill | `AGENTS_AND_SKILLS.md` |
| Day 2 decision | `DECISIONS.md` → ADR-007 |
| Currency module | `src/lib/policy-version.ts` |
| Auditor currency rule | `src/lib/faithfulness.ts` → `auditCitationCurrency` |
| Wired into ask | `src/lib/answer.ts` → `filterCurrentChunks` |
| Proof | GitHub Actions green · Playwright supersession test |
| Release | `v0.4.0` |

## Q&A cheats

Full bank: `CiteGuard-Panel-QA.pdf`

- **Conflict vs supersession?** Different families can multi-source conflict; same family → only current is valid.  
- **Why not rewrite?** Extract → retrieve → answer → audit stayed; twist is additive.  
- **Auditor change?** Quote must be real **and** from the currently effective version.
