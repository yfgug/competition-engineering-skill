# 竞赛与论文实验工程化 AI Skill

[English](README.md) | **简体中文**

[![Validate](https://github.com/yfgug/competition-engineering-skill/actions/workflows/validate.yml/badge.svg)](https://github.com/yfgug/competition-engineering-skill/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/yfgug/competition-engineering-skill)](https://github.com/yfgug/competition-engineering-skill/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一套面向多轮竞赛与实验型论文的人机协作协议：用可核验证据、持久化笔记、指标契约、claim-evidence、实验状态机和不可变基线，降低上下文丢失、重复实验、选择性报告、结论漂移与越权提交的风险。

> 方法来自真实的大模型推理优化比赛实践：200+ 队伍中前 23 名晋级国赛决赛，最终第 6 名；线上赛阶段官方分从 71.9 提升到 89.11，全程零违规。仓库在此基础上做了通用化，但不同赛种和研究类型仍需按评测形态裁剪。

## 适用范围

适合：

- 持续数周、需要多轮实验的竞赛。
- 有明确评分、排行榜、性能指标或复现目标。
- 需要人和 AI 跨会话继续工作。
- 提交额度、算力成本或合规风险较高。
- 需要把竞赛工程转成论文、技术报告或可复现 artifact。
- 已有大量历史实验，需要安全接管和整理的成熟项目。

默认不用于纯文案写作、普通文献综述、一次性 benchmark 或非实验型代码修改。

## 核心机制

| 机制 | 作用 |
|---|---|
| 证据层级 | 官方结果、原始产物、Git、笔记和聊天按可信度排序 |
| 唯一动态入口 | `00_先看这里.md` 保存指标契约、当前推荐和下一步 |
| 条件阻断 | 只阻断来源不明的冲突改动、越权动作和证据不足的结论 |
| 实验状态机 | 区分 pass、fail、inconclusive 和 invalid |
| 双评测台账 | `_evaluations.md` 记录本地评测，`_submissions.md` 记录真实外部提交 |
| 不可变基线 | 使用 commit SHA 或内容哈希定位保底版本 |
| 关闭路线 | 只有有效评测得到的 fail 才关闭，并写明重试条件 |
| Claim-evidence | 每个论文结论追到实验、代码、数据、统计和图表 |
| 存量审计 | 只读发现失效路径、入口漂移、重复目录和超大 AGENTS |

## 安装

### Codex

复制目录到个人或项目 Skill 发现路径，例如：

```powershell
Copy-Item -Recurse .\competition-engineering "$HOME\.codex\skills\competition-engineering"
```

仓库包含 `agents/openai.yaml`，默认允许自动发现，也可以显式使用 `$competition-engineering`。

### Claude Code

```bash
mkdir -p .claude/skills
cp -r competition-engineering .claude/skills/
```

### AGENTS.md 或规则型 Agent

```text
Read and follow <path-to>/competition-engineering/SKILL.md for multi-round competition and experimental-research work in this repo.
```

Skill 指令目前以中文为主。宿主需要能够读取 `SKILL.md`，并让 Agent 按需访问 `references/`、`assets/` 和 `scripts/`。

## 创建项目骨架

竞赛项目：

```powershell
node .\scripts\scaffold.cjs "D:\path\to\competition" --dry-run
node .\scripts\scaffold.cjs "D:\path\to\competition"
```

论文实验项目：

```powershell
node .\scripts\scaffold.cjs "D:\path\to\research" --profile research --dry-run
node .\scripts\scaffold.cjs "D:\path\to\research" --profile research
```

`research` profile 在通用结构上增加 `paper/CLAIMS.md`、`paper/ARTIFACTS.md` 和 `data/README.md`。已有模板文件默认跳过；显式传入 `--force` 才会覆盖。

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

## 接管已有项目

先运行只读审计，不要直接强制套模板：

```powershell
node .\scripts\audit_workspace.cjs "D:\path\to\existing-project"
node .\scripts\audit_workspace.cjs "D:\path\to\existing-project" --json
```

审计会报告缺失入口、失效绝对路径、可能重复的目录、超大 AGENTS、旧式笔记和入口晚于新笔记等风险。警告是调查线索，不会修改目标项目。

## 快速开始

1. 填 `00_先看这里.md`：项目类型、主指标、方向、硬约束、噪声方法和晋升规则。
2. 读官方规则、论文协议或数据许可，把稳定红线写入 `AGENTS.md`。
3. 建立 Git 基线或文件哈希快照，跑通 baseline。
4. 本地评测写入 `_evaluations.md`，真实外部提交写入 `_submissions.md`。
5. 用实验笔记记录假设、边界、原始证据和结果状态。
6. 写论文时用 `paper/CLAIMS.md` 和 `paper/ARTIFACTS.md` 追踪结论与图表。

## 仓库结构

```text
|-- SKILL.md
|-- CITATION.cff
|-- CHANGELOG.md
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
|-- examples/qwen-inference-optimization.md
`-- tests/
```

## 脱敏案例

[大模型推理优化存量工程接管案例](examples/qwen-inference-optimization.md) 展示了如何在不批量重命名历史笔记、不立即移动重复结果目录的前提下恢复可信入口，也说明了竞赛证据转化为论文 claim 时的适用范围边界。

## 引用与版本

GitHub 可以根据 [`CITATION.cff`](CITATION.cff) 生成引用格式。论文、公开 artifact 或长期复现应固定到 release/tag，不要只引用持续移动的分支；版本变化见 [`CHANGELOG.md`](CHANGELOG.md)。

## 验证

```powershell
node --check .\scripts\scaffold.cjs
node --check .\scripts\audit_workspace.cjs
node --test .\tests\scaffold.test.cjs .\tests\audit-workspace.test.cjs
node .\scripts\validate_skill.cjs
```

GitHub Actions 会在 Windows 和 Linux 上运行同一组验证。Skill frontmatter 也可使用 Codex `skill-creator/scripts/quick_validate.py` 验证。

## 许可证

[MIT](LICENSE)
