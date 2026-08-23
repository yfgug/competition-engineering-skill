# Competition Engineering Skill

**English** | [简体中文](README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A battle-tested AI skill that turns "human + AI" competition engineering from unreliable chat memory into a disciplined, on-disk protocol system — **persistent notes, hard red lines, quantified gates, and unpollutable baselines**.

> Distilled from a real competition: **top 6 in the national finals** of an LLM inference optimization contest (23 finalist teams out of 200+), official score 71.9 → 89.11 during the online stage, **zero rule violations** throughout.

## What problem does this solve?

When an AI agent is your main executor over a weeks-long competition, three things kill you:

1. **Chat memory is unreliable** — sessions get compressed or closed, conclusions vanish.
2. **Undocumented decisions drift** — verbal agreements get silently violated.
3. **Wasted compute on repeated failures** — closed routes get retried; evaluator noise gets treated as real gains.

This skill fixes all three with an on-disk protocol system.

## Core mechanisms

| Mechanism | What it does |
|---|---|
| **Persistent notes** | Every substantive event → a numbered note (`YYYYMMDD_NN_topic_status.md`) with fixed header & 7-section body. Notes are the single source of truth. |
| **Hard red lines** | Official rules translated into executable "do NOT X" items, enforced as AI hard stops. |
| **Quantified gates** | Every route declares pass/fail numbers *before* experimenting; below gate → closed immediately. |
| **Unpollutable baseline** | Officially verified best is immutable; experiments branch from clean copies only. |
| **Two ledgers** | `_closed_routes.md` (never re-burn compute) + `_submissions.md` (detect evaluator variance). |
| **If-then blockers** | e.g. dirty `git status` → refuse to proceed; score mismatch within variance → forbid code changes. |

## Installation

The skill is a plain Markdown + one Node.js script bundle with a standard `SKILL.md` entry (YAML frontmatter + instructions). It works with **any agent framework that supports "skills" / "custom instructions" / "project rules"** — Claude Skills (Claude Code / Claude apps), Cursor Rules, AGENTS.md-style agents (Codex etc.), Codely/Tuanjie CLI, or simply pasting `SKILL.md` into any chat AI as a system prompt.

### Option 1: Claude / Claude Code (Claude Skills format)

Copy this folder into a skills directory:

```bash
# Claude Code (project scope)
mkdir -p .claude/skills && cp -r competition-engineering .claude/skills/
# or personal scope
cp -r competition-engineering ~/.claude/skills/
```

The `SKILL.md` frontmatter follows the standard skills format (name + description), so Claude picks it up automatically in the next session.

### Option 2: Any AGENTS.md-based agent (Codex, Codely/Tuanjie CLI, ...)

Copy the folder to your agent's skills/rules discovery path, or reference it from your project's `AGENTS.md`:

```text
Read and follow <path-to>/competition-engineering/SKILL.md for all competition work in this repo.
```

For Codely/Tuanjie CLI specifically:

```bash
codely skills install ./competition-engineering.skill --scope user
# or manually copy to %USERPROFILE%\.codely-cli\skills\ (Windows) / ~/.codely-cli/skills/ (Linux/macOS)
```

Then run your agent's reload command (e.g. `/skills reload`, verify with `/skills list`).

### Option 3: Cursor / other rule-based editors

Point your project rules at `SKILL.md`, e.g. add a rule in `.cursor/rules/` that references this file.

### Option 4: No agent runtime — just paste it

Open `SKILL.md` (plus `references/*.md` as needed) and paste it into any chat AI as the system/first message. The workflows are plain Markdown; any competent LLM can follow them.

### Option 5: Scaffold only (no AI at all)

You don't need the skill runtime — just copy the templates:

```bash
node scripts/scaffold.cjs /path/to/your/competition
```

This creates the full skeleton (idempotent):

```text
your-competition/
├── 00_START_HERE.md     # single entry point (00_先看这里.md)
├── README.md
├── AGENTS.md            # AI constraints & routing
├── notes/               # persistent notes + 2 ledgers
├── scripts/
├── results/
├── backups/             # baseline snapshots (zip + SHA256)
├── source/
├── deliver/
├── archive/
└── tmp/
```

## Quick start

1. **New competition** → ask your AI to scaffold: "scaffold my competition project" / “帮我搭比赛工程骨架”
2. **Every session** → the AI reads the entry point + authority notes before touching anything.
3. **Every experiment** → single variable → L0 smoke → L1 A/B → L2 full eval → L3 gate check → note written.
4. **Official score arrives** → Workflow G: promote or close, baseline snapshot, ledgers updated.

## Repo layout

```text
├── SKILL.md                    # skill entry (workflows A–G + blockers)
├── references/
│   ├── methodology.md          # full methodology
│   ├── templates.md            # all templates
│   └── adaptations.md          # per-competition-type trimming table
├── assets/scaffold/            # skeleton template files
└── scripts/scaffold.cjs        # one-shot scaffolder
```

## Adapting to your competition type

The four non-negotiables for any competition: **notes system, red lines, unpollutable baseline, anti-self-deception**. Everything else adapts — see `references/adaptations.md` for Kaggle-style, systems/performance, hackathons, CTF, robotics, and research-replication variants.

## License

[MIT](LICENSE)
