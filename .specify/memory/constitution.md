# CiteGuard Constitution (Spec Kit)

## Purpose

Build a Track C knowledge/compliance agent that answers **only** from uploaded policy documents, always with citations — or refuses.

## Principles

1. **Groundedness over fluency.** Prefer extractive quotes to eloquent hallucination.
2. **Refusal is a feature.** Weak retrieval → refuse with zero citations.
3. **Agents are executable.** The Citation Auditor runs in `src/lib/faithfulness.ts`, not only as prose.
4. **CI without API keys.** Unit + Playwright must pass with extractive mode alone.
5. **Human in the loop.** Review plans and risky diffs; commit progressively.
6. **Design for Day 2.** Keep extract / store / retrieve / answer / audit as separable modules.
7. **No secrets in git.** Use `.env.example` only.

## Non-negotiable quality bar

- Architecture documented
- Agent rules present
- Working demonstrable app
- Custom agent + skill documented
- Green GitHub Actions

## Related

- Root rules: `AGENTS.md`
- Decisions: `DECISIONS.md`
- Day 2: `DAY2_PLAYBOOK.md`
