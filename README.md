# Competition and Experimental Research Engineering Skill

**English** | [简体中文](README.zh-CN.md)

A reusable human-AI protocol for multi-round competitions and experiment-driven papers. It anchors decisions to verifiable evidence, persistent notes, metric contracts, claim-evidence links, explicit route states, and immutable baselines.

> The method was distilled from an LLM inference optimization competition: 23 finalists from 200+ teams, sixth place in the national final, and an online-stage score improvement from 71.9 to 89.11 with no rule violations. The repository generalizes that experience, but each competition and research type still needs evaluation-specific adaptation.

## Scope

Use it for projects that:

- Run through multiple experiment rounds over days or weeks.
- Have a score, leaderboard, benchmark, performance target, or replication criterion.
- Need human and AI collaborators to resume across sessions.
- Carry meaningful submission, compute, compliance, or reproducibility risk.
- Turn competition engineering into a paper, technical report, or reproducible artifact.
- Need to adopt a mature workspace with substantial experiment history.

It should not activate automatically for prose-only writing, ordinary literature reviews, one-off benchmarks, or non-experimental code changes.

## Core mechanisms

| Mechanism | Purpose |
|---|---|
| Evidence hierarchy | Orders official results, raw artifacts, Git state, notes, and chat claims |
| Single dynamic entry | `00_先看这里.md` holds the metric contract, current recommendation, and next action |
| Conditional blockers | Stop on conflicting unknown changes, missing authorization, or invalid evidence |
| Experiment states | Separate pass, fail, inconclusive, and invalid outcomes |
| Separate ledgers | `_evaluations.md` for local evaluation and `_submissions.md` for real external submissions |
| Immutable baseline | Identifies baselines by commit SHA or content hash |
| Claim-evidence | Traces each paper claim to experiments, code, data, statistics, and figures |
| Workspace audit | Detects stale paths, authority drift, duplicate directories, and oversized AGENTS |

## Installation

### Codex

```powershell
Copy-Item -Recurse .\competition-engineering "$HOME\.codex\skills\competition-engineering"
```

The repository includes `agents/openai.yaml`. Invoke it explicitly with `$competition-engineering` or allow normal automatic selection.

### Claude Code

```bash
mkdir -p .claude/skills
cp -r competition-engineering .claude/skills/
```

### AGENTS.md or rule-based agents

```text
Read and follow <path-to>/competition-engineering/SKILL.md for multi-round competition and experimental-research work in this repo.
```

The skill instructions are currently Chinese-first. The host must let the agent read `SKILL.md` and access `references/`, `assets/`, and `scripts/` as needed.

## Scaffold a project

Competition project:

```powershell
node .\scripts\scaffold.cjs "D:\path\to\competition" --dry-run
node .\scripts\scaffold.cjs "D:\path\to\competition"
```

Experimental research project:

```powershell
node .\scripts\scaffold.cjs "D:\path\to\research" --profile research --dry-run
node .\scripts\scaffold.cjs "D:\path\to\research" --profile research
```

The research profile adds `paper/CLAIMS.md`, `paper/ARTIFACTS.md`, and `data/README.md`. Existing files are skipped unless `--force` is explicitly supplied.

```text
<project>/
|-- 00_先看这里.md
|-- README.md
|-- AGENTS.md
|-- notes/
|-- scripts/
|-- results/
|-- backups/
|-- source/
|-- deliver/
|-- archive/
|-- tmp/
|-- paper/                 # research profile
`-- data/                  # research profile
```

## Adopt an existing workspace

Run the read-only audit before applying templates:

```powershell
node .\scripts\audit_workspace.cjs "D:\path\to\existing-project"
node .\scripts\audit_workspace.cjs "D:\path\to\existing-project" --json
```

It reports missing entrypoints, stale absolute paths, potentially duplicate directories, oversized AGENTS files, legacy notes, and notes newer than the current entry. Warnings are investigation leads; the audit never modifies the target.

## Quick start

1. Define the project type, primary metric, direction, constraints, noise method, and promotion rule in `00_先看这里.md`.
2. Translate official rules, research protocols, and data licenses into stable constraints in `AGENTS.md`.
3. Establish a Git baseline or content-hash snapshot and reproduce the baseline.
4. Record local evaluations in `_evaluations.md` and real external submissions in `_submissions.md`.
5. Preserve hypotheses, boundaries, raw evidence, and outcomes in experiment notes.
6. For papers, trace claims and figures through `paper/CLAIMS.md` and `paper/ARTIFACTS.md`.

## Repository layout

```text
|-- SKILL.md
|-- agents/openai.yaml
|-- references/
|   |-- methodology.md
|   |-- evaluation.md
|   |-- research.md
|   |-- adoption.md
|   |-- templates.md
|   `-- adaptations.md
|-- assets/scaffold/
|-- assets/research/
|-- scripts/scaffold.cjs
|-- scripts/audit_workspace.cjs
`-- tests/
```

## Validation

```powershell
node --check .\scripts\scaffold.cjs
node --check .\scripts\audit_workspace.cjs
node --test .\tests\scaffold.test.cjs .\tests\audit-workspace.test.cjs
```

GitHub Actions runs the same checks on Windows and Linux. Validate the skill frontmatter with Codex's `skill-creator/scripts/quick_validate.py` when available.

## License

[MIT](LICENSE)
