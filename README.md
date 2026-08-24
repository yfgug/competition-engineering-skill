# Competition Engineering Skill

**English** | [简体中文](README.zh-CN.md)

A reusable human-AI protocol for multi-round competitions. It keeps decisions anchored to verifiable evidence, persistent experiment notes, metric contracts, explicit route states, and immutable baselines.

> The method was distilled from an LLM inference optimization competition: 23 finalists from 200+ teams, sixth place in the national final, and an online-stage score improvement from 71.9 to 89.11 with no rule violations. The repository generalizes that experience, but each competition type still needs evaluation-specific adaptation.

## Scope

Use it for projects that:

- Run through multiple experiment rounds over days or weeks.
- Have a score, leaderboard, performance target, or replication criterion.
- Need human and AI collaborators to resume across sessions.
- Carry meaningful submission, compute, compliance, or delivery risk.

It should not activate automatically for one-off benchmarks, ordinary project scaffolding, or non-competition code changes.

## Core mechanisms

| Mechanism | Purpose |
|---|---|
| Evidence hierarchy | Orders official results, raw artifacts, Git state, notes, and chat claims |
| Single dynamic entry | `00_先看这里.md` holds the metric contract, current recommendation, and next action |
| Conditional blockers | Stop on conflicting unknown changes, missing authorization, or invalid evidence |
| Experiment states | Separate pass, fail, inconclusive, and invalid outcomes |
| Separate ledgers | `_evaluations.md` for local evaluation and `_submissions.md` for official submissions |
| Immutable baseline | Identifies baselines by commit SHA or content hash |
| Closed-route registry | Closes only valid failures and records evidence required for retry |

## Installation

### Codex

Copy the directory into a personal or project skill discovery path, for example:

```powershell
Copy-Item -Recurse .\competition-engineering "$HOME\.codex\skills\competition-engineering"
```

The repository includes `agents/openai.yaml` for Codex discovery. Invoke it explicitly with `$competition-engineering` or allow normal automatic selection.

### Claude Code

```bash
mkdir -p .claude/skills
cp -r competition-engineering .claude/skills/
```

### AGENTS.md or rule-based agents

Reference the entrypoint from the project's rules:

```text
Read and follow <path-to>/competition-engineering/SKILL.md for multi-round competition engineering work in this repo.
```

The skill instructions are currently Chinese-first. The host must let the agent read `SKILL.md` and access `references/`, `assets/`, and `scripts/` as needed.

## Scaffold a competition project

Run from the cloned repository or installed skill directory. Preview first:

```powershell
node .\scripts\scaffold.cjs "D:\path\to\competition" --dry-run
node .\scripts\scaffold.cjs "D:\path\to\competition"
```

Existing template files are skipped by default. Passing `--force` explicitly enables overwrite. The script runs on Node.js under Windows, Linux, and macOS.

Generated structure:

```text
<competition>/
|-- 00_先看这里.md
|-- README.md
|-- AGENTS.md
|-- notes/
|   |-- README.md
|   |-- _evaluations.md
|   |-- _submissions.md
|   `-- _closed_routes.md
|-- scripts/
|-- results/
|-- backups/
|-- source/
|-- deliver/
|-- archive/
`-- tmp/
```

## Quick start

1. Fill in the primary metric, direction, constraints, noise method, and promotion rule in `00_先看这里.md`.
2. Translate official rules and Q&A into stable, executable red lines in `AGENTS.md`.
3. Establish a Git baseline or content-hash snapshot and reproduce the baseline.
4. Record local evaluations in `_evaluations.md` and official submissions in `_submissions.md`.
5. Use experiment notes to preserve hypotheses, boundaries, raw evidence, and outcomes.

## Repository layout

```text
|-- SKILL.md
|-- agents/openai.yaml
|-- references/
|   |-- methodology.md
|   |-- evaluation.md
|   |-- templates.md
|   `-- adaptations.md
|-- assets/scaffold/
|-- scripts/scaffold.cjs
`-- tests/scaffold.test.cjs
```

## Validation

```powershell
node --check .\scripts\scaffold.cjs
node --test .\tests\scaffold.test.cjs
```

Validate the skill frontmatter with Codex's `skill-creator/scripts/quick_validate.py` when available.

## License

[MIT](LICENSE)
