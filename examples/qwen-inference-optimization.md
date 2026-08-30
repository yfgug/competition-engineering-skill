# Case Study: Adopting a Mature LLM Inference Optimization Workspace

This sanitized case study shows how the skill was derived from, and then reapplied to, a real multi-round engineering workspace. It contains no competition source code, credentials, model files, private infrastructure details, or submission packages.

## Context

The source project supported an LLM inference optimization competition over many experiment rounds. The team advanced from more than 200 teams to 23 national finalists, placed sixth in the final, and improved the online-stage score from 71.9 to 89.11 without rule violations.

The workspace was effective but had accumulated history faster than its governance structure evolved. The goal was not to rename everything. The goal was to recover a trustworthy current state without breaking active scripts or losing evidence.

## Read-only audit

The default governance-focused audit scanned 357 Markdown files and reported 0 errors and 41 warnings. The warnings were investigation leads, not automatic proof that files were wrong. Full-workspace scans should exclude copied repositories and generated trees explicitly.

| Finding | Observed shape | Engineering risk |
|---|---|---|
| Legacy role paths | Notes, results, and backups used historical directory names | New agents may write the same responsibility into a second location |
| Missing ledgers | Evaluation, external-submission, and closed-route ledgers were absent | Local runs, official results, and rejected ideas can become mixed |
| Duplicate result roles | `output/`, `outputs/`, and an analysis directory coexisted | Evidence can be duplicated or referenced from the wrong location |
| Stale absolute paths | Current documents still pointed to a previous machine root | A correct note becomes unusable after relocation |
| Oversized authority file | `AGENTS.md` was 85,541 bytes and included dynamic note references | Stable rules and current state can contradict each other |
| Legacy note conventions | 133 notes used historical names or frontmatter conventions | Bulk renaming would create churn and break references |
| Encoding drift | Six Markdown files used UTF-8 BOM | Cross-tool diffs and parsing can become inconsistent |
| Entry drift | The dynamic entry was older than newer experiment notes | A resumed session may start from an obsolete recommendation |

## Responsibility mapping

The existing directories were mapped to canonical responsibilities before any migration:

| Existing shape | Canonical responsibility | Adoption action |
|---|---|---|
| Historical persistent-note directory | `notes/` | Keep the directory initially; document the mapping in the entry |
| Multiple output and analysis directories | `results/` | Identify producers and consumers before selecting one canonical location |
| Historical backup directories | `backups/` | Preserve immutable baselines; separate them from generated output |
| Large `AGENTS.md` | Stable constraints only | Move current recommendations and dynamic note pointers to `00_先看这里.md` |
| Legacy experiment notes | Historical evidence | Index existing notes; use the new template only for active work |

## Incremental remediation

1. Run the audit without modifying the target workspace.
2. Repair `00_先看这里.md` so it names the current objective, immutable baseline, authoritative evidence, and one next action.
3. Replace machine-bound paths in current authority documents with project-relative paths.
4. Keep stable permissions, environment constraints, and competition rules in `AGENTS.md`; remove its role as a dynamic note index.
5. Create `_evaluations.md`, `_submissions.md`, and `_closed_routes.md` from current active evidence. Do not reconstruct history by spending submission quota or rerunning expensive experiments.
6. Map legacy directories before moving them. Preserve compatibility until callers and scripts are known.
7. Leave historical note names intact and apply the current schema to new or actively corrected notes.

## Competition-to-paper boundary

A leaderboard result is evidence for a locked competition environment, not a universal systems claim. A paper derived from this workspace should create a claim such as:

```text
C-001: Under the recorded model, hardware, data, evaluator, and constraints,
candidate <commit> improves the primary metric over baseline <commit> by more
than the predeclared practical and noise thresholds.
```

The claim must point to code and data identities, local paired or repeated evaluations, hard-constraint checks, raw artifacts, and the official result when external validation is required. Claims about other models, hardware, workloads, or mechanisms need separate evidence.

## Result

The case study validates two design choices in the skill:

- Mature projects need adoption and authority recovery before they need a new directory tree.
- Competition evidence can support a paper only after scope, provenance, uncertainty, and claim-evidence links are made explicit.

Use `scripts/audit_workspace.cjs` to reproduce the structural audit on another workspace. Treat every warning as a prompt to inspect evidence and callers, never as permission to move or delete files automatically.
