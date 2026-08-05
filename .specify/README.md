# Spec Kit trail — CiteGuard
# Mirrors the GitHub Spec Kit workflow (constitution → specify → plan → tasks → analyze → implement)
# so judges can walk the ADLC without requiring the specify CLI at clone time.

## Workflow mapping

| Spec Kit command | Artifact in this repo |
| --- | --- |
| `/speckit.constitution` | `.specify/memory/constitution.md` (+ root `AGENTS.md`) |
| `/speckit.specify` | `.specify/specs/001-citeguard/spec.md` |
| `/speckit.plan` | `.specify/specs/001-citeguard/plan.md` |
| `/speckit.tasks` | `.specify/specs/001-citeguard/tasks.md` |
| `/speckit.analyze` | `.specify/specs/001-citeguard/analyze.md` |
| `/speckit.implement` | Application under `src/` + CI |

## How to re-run with Spec Kit (optional)

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
# Then in an agent session: /speckit.constitution … /speckit.implement
```

Existing files here are the source of truth for Deploy or Die judging.
