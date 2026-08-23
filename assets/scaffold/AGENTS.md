# AI 工作约束

## 1. 目标

<一段话：赛题、评分构成、当前目标>

## 2. 红线（hard stop，逐条可执行）

- 不改 <官方固定的东西：参数/输入/评测器/模型/数据…>
- 不做 <官方 Q&A 明确禁止的技术…>
- 不覆盖、不 force-push 基线分支
- 提交/推送/交付必须用户明确授权
- <赛种特定红线…>

## 3. 权威路由（读文件顺序）

1. notes/YYYYMMDD_NN_xxx.md — <一句话状态>
2. notes/YYYYMMDD_NN_yyy.md — <一句话状态>

（只列 3–8 篇当前权威；历史索引见 notes/README.md；closed 清单见 notes/_closed_routes.md）

## 4. 工作纪律

- 单变量；一场会话只推进一个方向；每条路线先写门槛再动手
- 组合实验必须先有单变量结论，组合后重新走完整验证单独审计
- 快检只判"能否继续"，不预测最终分
- 实质事件后先写笔记再换方向；closed 路线登记 notes/_closed_routes.md
- 开新路线前先查 notes/_closed_routes.md 与 notes/_submissions.md（方差）
- 基线只在干净副本上做实验（动手前 git status --short 为空）
- 对外导出源码从 git archive HEAD 导出，不复制工作树

## 5. 环境速查

- 平台/容器入口: <…>
- 常用命令: <构建 / 启动 / 冒烟 / 全量评测>
- 已知环境坑: <指向对应笔记>
