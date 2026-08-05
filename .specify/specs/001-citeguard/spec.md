# Spec: CiteGuard Policy Q&A (001)

## Problem statement

Organizations store policies as messy documents. Employees and operators ask LLMs anyway and receive confident answers that cannot be audited.

## Goals

- Upload policy text (txt/md/pdf)
- Ask natural-language questions
- Return grounded answers with clickable citations **or** refuse
- Persist an audit trail (UI + CSV)
- Verify citation faithfulness automatically

## Non-goals

- Full enterprise IAM
- Managed vector database (v1)
- Streaming chat UX

## User journeys

1. First open → seeded Acme policy → ask leave days → see `18` + source jump
2. Ask irrelevant question → refusal
3. Upload second conflicting policy → multi-source conflict banner
4. Export audit CSV

## Success metrics (hackathon)

- Clears Deploy or Die gate
- Judges can clone and run in ~60s (npm or Docker)
- Faithfulness tests green in CI
