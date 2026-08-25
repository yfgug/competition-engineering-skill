# 模板字段说明

规范模板以 `assets/scaffold/` 和 `assets/research/` 中的文件为唯一来源。需要创建或更新项目文件时，读取对应模板；本文件只解释字段，避免复制模板后产生两套内容。

| 目标文件 | 规范模板 | 用途 |
|---|---|---|
| `00_先看这里.md` | `assets/scaffold/00_先看这里.md` | 唯一动态入口、指标契约、当前推荐与下一步 |
| `AGENTS.md` | `assets/scaffold/AGENTS.md` | 稳定红线、权限和环境入口 |
| `notes/README.md` | `assets/scaffold/notes/README.md` | 历史索引 |
| 实验笔记 | `assets/scaffold/notes/_TEMPLATE.md` | 假设、边界、证据、结果和更正关系 |
| `notes/_evaluations.md` | `assets/scaffold/notes/_evaluations.md` | 本地评测和噪声 |
| `notes/_submissions.md` | `assets/scaffold/notes/_submissions.md` | 官方评测、论文投稿和 artifact/data 发布 |
| `notes/_closed_routes.md` | `assets/scaffold/notes/_closed_routes.md` | 已拒绝路线和重试条件 |
| `results/<主题>_<日期>/summary.md` | `assets/scaffold/results/_TEMPLATE.md` | 原始结果索引和复现信息 |
| `paper/README.md` | `assets/research/paper/README.md` | 论文状态与研究类型 |
| `paper/CLAIMS.md` | `assets/research/paper/CLAIMS.md` | claim-evidence 矩阵 |
| `paper/ARTIFACTS.md` | `assets/research/paper/ARTIFACTS.md` | 图表与表格生成链 |
| `data/README.md` | `assets/research/data/README.md` | 数据、模型来源与许可 |

## 入口字段

- **主指标与方向**：必须声明 `maximize` 或 `minimize`。
- **硬约束**：正确性、时限、资源、赛规等任何一项失败即不能晋升。
- **噪声方法**：说明如何估计，而不是只填一个没有来源的波动数字。
- **当前推荐**：使用 commit SHA 或内容哈希，不依赖可移动分支名。
- **权威证据**：指向笔记、原始结果或官方记录，不把摘要当作原始证据。
- **下一步唯一动作**：当前最有价值、可执行的一步。
- **路径约定**：项目内使用相对路径，外部路径必须带环境标识。

## 笔记头部

模板使用 YAML frontmatter，字段职责如下：

- `status`：笔记状态，`open | pending | closed`。
- `outcome`：实验结果，`pending | pass | fail | inconclusive | invalid`。
- `verification`：`verified | unverified`。
- `work_type`：`causal | repair | integration | infrastructure`。
- `claims`：对应的 `paper/CLAIMS.md` claim ID；非论文实验可以为空。
- `baseline`：commit SHA 或内容哈希。
- `initial_tree`：实验开始时的工作树边界。
- `gate`：预先定义的方向、约束和门槛。
- `supersedes`：本文纠正或替代的笔记。
- `retry_when`：`fail/closed` 时必填的新证据条件。

## 台账边界

- 本地运行、随机种子、方差和无效评测进入 `_evaluations.md`。
- 真实官方评测、论文投稿和发布进入 `_submissions.md`。
- 只有有效评测得到的 `fail` 才进入 `_closed_routes.md`。
- 原始大文件放在 `results/`，台账和笔记只保存路径、哈希与摘要。

## 更正与安全

历史记录默认追加更正并保留 `supersedes` 关系。凭证、个人信息或危险错误不受“不可修改历史”约束：清理敏感内容后留下更正说明和可审计记录。
