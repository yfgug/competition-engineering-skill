---
status: open
outcome: pending
verification: unverified
work_type: causal
date: YYYY-MM-DD
route: "<route-slug>"
baseline: "<commit-or-content-hash>"
initial_tree: "<clean-or-known-change-summary>"
gate: "<direction + constraints + threshold>"
supersedes: []
retry_when: "none"
evidence:
  - "results/<主题>_<日期>/summary.md"
---

# <一句话标题>

## 背景与假设

<为什么做，预期收益或问题来源。>

## 边界

- 目标文件: <精确范围>
- 不触碰: <用户改动或范围外目录>
- 工作类型: causal / repair / integration / infrastructure

## 方法

- 环境: <作业号/容器/机器/依赖版本>
- 基线: <commit / 内容哈希>
- 初始工作树: <git status 摘要>
- 改动: <精确到文件级>
- 评测命令: <命令>

## 结果

- 主指标: <baseline -> candidate>
- 硬约束: <逐项通过/失败>
- 有效性: valid / invalid
- 原始证据: <results 路径、日志或官方记录>
- 结果分类: pending / pass / fail / inconclusive / invalid

## 判定

<对照预先 gate 说明结论。只有 valid + fail 才关闭路线。>

## 未变清单

- <没有改动的关键配置、输入、接口或用户文件>
- <未执行的外部动作，如未 push / 未官方提交>

## 风险与异常

<环境漂移、缓存、编码、数据泄漏、测量异常等。>

## 更正关系

<无则写 none；如纠正旧结论，解释 supersedes 原因。>

## 下一步唯一动作

<一句可执行动作。>
