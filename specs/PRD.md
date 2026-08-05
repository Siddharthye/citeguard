# CiteGuard PRD / Specification

## Problem

Teams drown in policy PDFs and handbooks. People ask LLMs anyway, and get confident wrong answers with no paper trail.

## Solution

CiteGuard lets a user upload policy text (txt/md/pdf), ask a question, and receive either:

- a grounded answer with quoted source passages, or
- a clear refusal when the documents do not support an answer.

Every interaction is audited. A **runtime Citation Auditor** verifies quotes against source documents.

## Users

- Compliance / HR operators answering employee questions
- Hackathon judges verifying citation quality and refusal behavior

## User stories + acceptance criteria

| ID | Story | Acceptance |
| --- | --- | --- |
| US-1 | Open app and ask about seeded policy | Leave question yields answer containing `18` + ≥1 citation |
| US-2 | Upload txt/md policy | Document appears in Sources list |
| US-3 | Upload PDF policy | Multipart upload extracts text; doc listed |
| US-4 | Ask out-of-scope question | Answer matches “I don’t know…”; `citations: []` |
| US-5 | Click a citation | Source panel opens; cited span visible |
| US-6 | Review audit trail | Audit list + CSV export include recent questions |
| US-7 | Trust answers | `faithful: true` on extractive answers; unit tests cover auditor |
| US-8 | CI without LLM keys | GitHub Actions runs lint, unit, build, Playwright green |

## Given / When / Then (examples)

1. **Given** the seeded Acme policy, **When** I ask about paid leave days, **Then** I see `18` and can open the source quote.
2. **Given** any loaded docs, **When** I ask about cafeteria pizza, **Then** the system refuses with no citations.
3. **Given** an LLM answer inventing `99` days, **When** the auditor runs, **Then** the system rejects it and falls back to extractive quotes.

## Out of scope (v0.2)

- Multi-user auth
- Managed database
- Streaming chat UI
- Full semantic embeddings (see ADR-001)

## Related docs

- `ARCHITECTURE.md`
- `DECISIONS.md`
- `DAY2_PLAYBOOK.md`
- `AGENTS_AND_SKILLS.md`
