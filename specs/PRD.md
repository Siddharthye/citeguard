# CiteGuard PRD / Specification

## Problem

Teams drown in policy PDFs and handbooks. People ask LLMs anyway, and get confident wrong answers with no paper trail.

## Solution

CiteGuard lets a user upload policy text, ask a question, and receive either:

- a grounded answer with quoted source passages, or
- a clear refusal when the documents do not support an answer.

Every interaction is audited.

## Users

- Compliance / HR operators answering employee questions
- Hackathon judges verifying citation quality and refusal behavior

## User stories

1. **As a user**, I can open the app and immediately ask about the seeded sample policy so the demo works without setup.
2. **As a user**, I can upload `.txt` / `.md` policy content and see it listed under Sources.
3. **As a user**, when I ask an in-scope question, I see an answer and at least one citation quote.
4. **As a user**, when I ask something absent from the docs, I see “I don’t know…” and no citations.
5. **As a reviewer**, I can inspect the audit log for question, refusal flag, and citation count.
6. **As a developer**, I can run unit + Playwright tests in CI without providing an LLM key.

## Acceptance criteria

- `/api/health` returns `{ status: "ok" }`.
- Seeded document is present after first documents fetch.
- In-scope leave question mentions `18` and shows citations in the UI.
- Out-of-scope question refuses.
- Upload + ask path works for a new document.
- GitHub Actions workflow runs lint, unit tests, build, and Playwright.

## Out of scope (v0.1)

- Multi-user auth
- Persistent database
- Native PDF binary parsing (paste/extract text first)
- Streaming chat UI
