# Analyze (read-only consistency check)

Performed as the Spec Kit `/speckit.analyze` equivalent before the polish implement slice.

## Spec ↔ plan

- Spec goals match plan architecture (upload → ask → cite/refuse → audit).
- Non-goals align with ADRs (no managed vector DB in v1).

## Plan ↔ tasks

- Phase A/B tasks map to existing `src/lib/*` and e2e coverage.
- Phase C tasks are delivery/ADLC polish, not a product rewrite.

## Gaps found (and disposition)

| Gap | Disposition |
| --- | --- |
| Spec Kit folder missing | Add `.specify/` trail (this tree) |
| Multi-doc conflict only flagged in JSON | Add UI banner when `multiSource` |
| Judge run friction | Docker + 60s README |
| Local quality gate soft | Husky pre-commit lint + unit |

## Ready to implement

Yes — Phase C only; do not disturb extractive CI path.
