# Competition Engineering Skill 比赛工程化 AI Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A battle-tested AI skill that turns "human + AI" competition engineering from unreliable chat memory into a disciplined, on-disk protocol system — **persistent notes, hard red lines, quantified gates, and unpollutable baselines**.

一个经过实战验证的 AI Skill：把"人和 AI 一起打比赛"中所有不可靠的部分（记忆、口头约定、临时判断）全部换成落盘协议，让每次会话、每个实验都从确定状态出发。

> Distilled from a real competition: **200+ teams, ranked #6 nationally** (LLM inference optimization), official score 71.9 → 89.11, **zero rule violations** throughout.
>
> 提炼自真实比赛：200+ 队伍国奖第 6 名，官方分 71.9 → 89.11，全程零违规。

## What problem does this solve? 解决什么问题

When an AI agent is your main executor over a weeks-long competition, three things kill you:

当 AI 是你数周比赛的主要执行者时，三件事会毁掉你：

1. **Chat memory is unreliable** — sessions get compressed/closed, conclusions vanish. 聊天记忆不可靠，会话断开结论就丢。
2. **Undocumented decisions drift** — verbal agreements get silently violated. 口头约定会漂移，被无声违反。
3. **Wasted compute on repeated failures** — closed routes get retried, noise gets treated as gains. 已关闭路线被重试，噪声被当成收益。

This skill fixes all three with an on-disk protocol system. 本 Skill 用一套落盘协议系统解决这三个问题。

## Core mechanisms 核心机制

| Mechanism 机制 | What it does 作用 |
|---|---|
| **Persistent notes** 持久化笔记 | Every substantive event → a numbered note (`YYYYMMDD_NN_topic_status.md`) with fixed header & 7-section body. Notes are the single source of truth. 每个实质事件落成编号笔记，唯一事实源 |
| **Hard red lines** 合规红线 | Official rules translated into executable "do NOT X" items, enforced as AI hard stops. 官方规则翻译成可执行红线，AI 硬停 |
| **Quantified gates** 量化门槛 | Every route declares pass/fail numbers *before* experimenting; below gate → closed immediately. 动手前定门槛，不过线立即关闭 |
| **Unpollutable baseline** 不可污染保底 | Officially verified best is immutable; experiments branch from clean copies only. 保底不可变，实验只从干净副本拉 |
| **Two ledgers** 两条台账 | `_closed_routes.md` (never re-burn compute) + `_submissions.md` (detect evaluator variance). 防重复烧算力 + 防被方差欺骗 |
| **If-then blockers** 阻断式校验 | e.g. dirty `git status` → refuse to proceed; score mismatch within variance → forbid code changes. 脏树即停；方差内差异禁止改码 |

## Installation 安装

### Option 1: Install the skill package (Tuanjie/Codely CLI)

```bash
# from a release .skill file
codely skills install ./competition-engineering.skill --scope user
```

Or manually copy the skill folder to the user-level discovery path:

手动复制到用户级发现路径：

```text
Windows: %USERPROFILE%\.codely-cli\skills\competition-engineering\
Linux/macOS: ~/.codely-cli/skills/competition-engineering/
```

Then run `/skills reload` in your AI session and verify with `/skills list`.

### Option 2: Scaffold only (no AI agent needed) 只用骨架模板

You don't need the skill runtime — just copy the templates:

不需要 AI 运行时，直接抄模板：

```bash
node scripts/scaffold.cjs /path/to/your/competition
```

This creates the full skeleton (idempotent): 一键生成完整骨架（幂等）：

```text
your-competition/
├── 00_先看这里.md        # single entry point 唯一入口
├── README.md
├── AGENTS.md             # AI constraints & routing AI 约束与路由
├── notes/                # persistent notes + 2 ledgers 笔记 + 两条台账
├── scripts/
├── results/
├── backups/              # baseline snapshots (zip + SHA256)
├── source/
├── deliver/
├── archive/
└── tmp/
```

## Quick start 快速开始

1. **New competition** → ask your AI to scaffold: "帮我搭比赛工程骨架" / "scaffold my competition project"
2. **Every session** → the AI reads `00_先看这里.md` + authority notes before touching anything. 每次会话 AI 先读入口和权威笔记
3. **Every experiment** → single variable → L0 smoke → L1 A/B → L2 full eval → L3 gate check → note written. 单变量 → 快检 → 对照 → 全量 → 门槛 → 笔记
4. **Official score arrives** → Workflow G: promote or close, baseline snapshot, ledgers updated. 出分后走晋升流程

## Repo layout 仓库结构

```text
├── SKILL.md                    # skill entry (workflows A–G + blockers) 技能入口
├── references/
│   ├── methodology.md          # full methodology 方法论全文
│   ├── templates.md            # all templates 模板集
│   └── adaptations.md          # per-competition-type trimming table 赛种裁剪表
├── assets/scaffold/            # skeleton template files 骨架模板文件
└── scripts/scaffold.cjs        # one-shot scaffolder 一键搭骨架
```

## Adapting to your competition type 适配你的赛种

The four non-negotiables for any competition: **notes system, red lines, unpollutable baseline, anti-self-deception**. Everything else adapts — see `references/adaptations.md` for Kaggle-style, systems/performance, hackathons, CTF, robotics, and research-replication variants.

四件套任何赛种不裁：笔记系统、红线、基线不可污染、防自欺。其余按裁剪表实例化（算法数据/系统性能/黑客松/CTF/机器人/科研复现）。

## License

[MIT](LICENSE)
