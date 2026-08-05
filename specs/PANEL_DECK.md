# Panel deck outline (5 slides)

Use this for Day 2 finalist presentation. Keep slides sparse; walk the repo live.

## 1. Problem
People ask LLMs about policies → invented answers, no paper trail.

## 2. Approach
CiteGuard: retrieve → cite or refuse → audit. Track C Knowledge & Compliance.

## 3. Architecture
Next.js app · chunk/retrieve · extractive (+ optional LLM) · **runtime Citation Auditor** · CSV audit. Point at `ARCHITECTURE.md` diagram.

## 4. What ADLC gave us
Constitution (`AGENTS.md`) · custom auditor agent wired to `faithfulness.ts` · chunk-and-index skill · Spec decisions in `DECISIONS.md` · green CI proving refusal + faithfulness.

## 5. Trade-offs & Day 2
Keyword-first for determinism (ADR-001). Twist lands via `DAY2_PLAYBOOK.md` without rewrite.
