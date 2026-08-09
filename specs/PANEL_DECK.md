# Panel deck (5 slides) — Day 2 finalists

Keep slides sparse; walk the repo live. Live: https://citeguard-two.vercel.app

## 1. Problem
People ask LLMs about policies → invented answers, no paper trail, no currency check.

## 2. Approach
CiteGuard: retrieve → **cite or refuse** → runtime Citation Auditor.  
Track C · Knowledge & Compliance. Faithfulness **and** currency.

## 3. Architecture
Next.js · chunk/retrieve · extractive (+ optional LLM) · `policy-version.ts` · auditor in `faithfulness.ts` · audit CSV.  
Point at `ARCHITECTURE.md`.

## 4. What ADLC gave us
Constitution (`AGENTS.md`) · Citation Auditor agent → executable tests · chunk-and-index skill · Spec Kit + `DECISIONS.md` · green CI.

## 5. Trade-offs & Day 2 twist
Keyword retrieval for CI determinism (ADR-001).  
**Day 2:** superseded policies — same `policyFamily`, different `effectiveDate` → cite only the current version; name the old one as superseded (ADR-007). Additive module, not a rewrite (`DAY2_PLAYBOOK.md`).
