# 比赛工程化 AI Skill

[English](README.md) | **简体中文**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个经过实战验证的 AI Skill：把"人和 AI 一起打比赛"中所有不可靠的部分（记忆、口头约定、临时判断）全部换成落盘协议——**持久化笔记、合规红线、量化门槛、不可污染保底**。

> 提炼自真实比赛：**200+ 队伍国奖第 6 名**（大模型推理优化赛），官方分 71.9 → 89.11，全程零违规。

## 解决什么问题？

当 AI 是你数周比赛的主要执行者时，三件事会毁掉你：

1. **聊天记忆不可靠** —— 会话被压缩/关闭，结论消失。
2. **口头约定漂移** —— 约定被无声违反。
3. **重复烧算力** —— 已关闭路线被重试；评测噪声被当成真实收益。

本 Skill 用一套落盘协议系统解决这三个问题。

## 核心机制

| 机制 | 作用 |
|---|---|
| **持久化笔记** | 每个实质事件落成编号笔记（`YYYYMMDD_NN_主题_状态.md`），固定头部 + 七要素正文。笔记是唯一事实源。 |
| **合规红线** | 官方规则翻译成可执行红线，作为 AI 硬停（hard stop）。 |
| **量化门槛** | 每条路线动手前声明"继续/关闭"的数字门槛；不过线立即关闭。 |
| **不可污染保底** | 官方验证过的最优版本不可变；实验只从干净副本拉分支。 |
| **两条台账** | `_closed_routes.md`（防重复烧算力）+ `_submissions.md`（识别评测方差）。 |
| **阻断式校验** | 如：脏 `git status` → 拒绝推进；出分差异在方差内 → 禁止改代码。 |

## 安装

### 方式一：作为 Skill 安装（Tuanjie/Codely CLI）

```bash
codely skills install ./competition-engineering.skill --scope user
```

或手动复制 skill 文件夹到用户级发现路径：

```text
Windows: %USERPROFILE%\.codely-cli\skills\competition-engineering\
Linux/macOS: ~/.codely-cli/skills/competition-engineering/
```

然后在 AI 会话中执行 `/skills reload`，用 `/skills list` 确认。

### 方式二：只用骨架模板（无需 AI 运行时）

```bash
node scripts/scaffold.cjs /path/to/your/competition
```

一键生成完整骨架（幂等）：

```text
your-competition/
├── 00_先看这里.md        # 唯一入口
├── README.md
├── AGENTS.md             # AI 约束与路由
├── notes/                # 持久化笔记 + 两条台账
├── scripts/
├── results/
├── backups/              # 基线快照（zip + SHA256）
├── source/
├── deliver/
├── archive/
└── tmp/
```

## 快速开始

1. **新比赛** → 让 AI 搭骨架："帮我搭比赛工程骨架"
2. **每次会话** → AI 先读入口文件和权威笔记再动手。
3. **每个实验** → 单变量 → L0 快检 → L1 对照 → L2 全量 → L3 门槛判定 → 写笔记。
4. **官方出分** → 走工作流 G：晋升或关闭，基线快照，台账更新。

## 仓库结构

```text
├── SKILL.md                    # 技能入口（工作流 A–G + 阻断规则）
├── references/
│   ├── methodology.md          # 方法论全文
│   ├── templates.md            # 模板集
│   └── adaptations.md          # 赛种裁剪表
├── assets/scaffold/            # 骨架模板文件
└── scripts/scaffold.cjs        # 一键搭骨架脚本
```

## 适配你的赛种

四件套任何赛种不裁：**笔记系统、红线、基线不可污染、防自欺**。其余按 `references/adaptations.md` 裁剪表实例化（算法数据/系统性能/黑客松/CTF/机器人/科研复现）。

## 许可证

[MIT](LICENSE)
