# 比赛工程化 AI Skill

[English](README.md) | **简体中文**

一套面向多轮竞赛的人机协作协议：用可核验证据、持久化笔记、指标契约、实验状态机和不可变基线，降低上下文丢失、重复实验、评测噪声误判与越权提交的风险。

> 方法来自真实的大模型推理优化比赛实践：200+ 队伍中前 23 名晋级国赛决赛，最终第 6 名；线上赛阶段官方分从 71.9 提升到 89.11，全程零违规。仓库在此基础上做了通用化，但不同赛种仍需按评测形态裁剪。

## 适用范围

适合：

- 持续数周、需要多轮实验的竞赛。
- 有明确评分、排行榜、性能指标或复现目标。
- 需要人和 AI 跨会话继续工作。
- 提交额度、算力成本或合规风险较高。

默认不用于一次性 benchmark、普通项目脚手架或非竞赛代码修改。

## 核心机制

| 机制 | 作用 |
|---|---|
| 证据层级 | 官方结果、原始产物、Git、笔记和聊天按可信度排序 |
| 唯一动态入口 | `00_先看这里.md` 保存指标契约、当前推荐和下一步 |
| 条件阻断 | 只阻断来源不明的冲突改动、越权动作和证据不足的结论 |
| 实验状态机 | 区分 pass、fail、inconclusive 和 invalid |
| 双评测台账 | `_evaluations.md` 记录本地评测，`_submissions.md` 只记录官方提交 |
| 不可变基线 | 使用 commit SHA 或内容哈希定位保底版本 |
| 关闭路线 | 只有有效评测得到的 fail 才关闭，并写明重试条件 |

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

让项目规则引用 Skill 入口：

```text
Read and follow <path-to>/competition-engineering/SKILL.md for multi-round competition engineering work in this repo.
```

Skill 指令目前以中文为主。框架需要能够读取 `SKILL.md`，并让 Agent 按需访问 `references/`、`assets/` 和 `scripts/`。

## 创建比赛骨架

从仓库或 Skill 安装目录运行，先预览：

```powershell
node .\scripts\scaffold.cjs "D:\path\to\competition" --dry-run
node .\scripts\scaffold.cjs "D:\path\to\competition"
```

已有模板文件默认跳过；显式传入 `--force` 才会覆盖。脚本支持 Windows、Linux 和 macOS 的 Node.js 运行时。

生成结构：

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

## 快速开始

1. 填 `00_先看这里.md`：主指标、方向、硬约束、噪声方法和晋升规则。
2. 读官方规则与 Q&A，把稳定红线写入 `AGENTS.md`。
3. 建立 Git 基线或文件哈希快照，跑通 baseline。
4. 本地评测写入 `_evaluations.md`，官方提交写入 `_submissions.md`。
5. 用实验笔记记录假设、边界、原始证据和结果状态。

## 仓库结构

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

## 验证

```powershell
node --check .\scripts\scaffold.cjs
node --test .\tests\scaffold.test.cjs
```

Skill frontmatter 可使用 Codex `skill-creator/scripts/quick_validate.py` 验证。

## 许可证

[MIT](LICENSE)
