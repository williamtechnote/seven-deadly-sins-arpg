# Lust Cadence Drift Note Design

**Context**

`scripts/e2e-report.mjs` 已经会把 `cadence-review.json`、`phase3-checkpoints.txt`、`shared-recovery-snapshot.json` 与 `telegraph-hud.png` 串成 markdown 版 `Phase 3 录屏复盘清单`。当前每条 checkpoint 已附上 `回切目标` 与 recovery 快照 short note，但排查 artifact 漂移时仍要手动比对 checkpoint 自己的 `expectedReturnLabel` 和 `shared-recovery-snapshot.json` 里的 `expectedReturnLabel`。

**Approaches**

1. 只在列表底部追加一条总括性 drift 摘要。
   改动最小，但仍然要在单条 checkpoint 与摘要之间来回跳。
2. 在每条 checkpoint 行直接内联 drift/match note。
   会重复一点信息，但最符合“扫一眼就知道是否漂移”的目标。
3. 把完整对比结果展开成多行 block。
   细节完整，但会破坏 checklist 的扫描性。

**Recommendation**

选择方案 2。每条 checkpoint 行继续保留 `回切目标`、recovery 快照与 artifact anchor，同时新增一段 `回切校验` 短 note，直接对比 checkpoint 的 `expectedReturnLabel` 与 `shared-recovery-snapshot.json` 的 `expectedReturnLabel`。

**Formatting Rules**

- match 时输出 `回切校验: match`
- drift 时输出 `回切校验: drift checkpoint=<...> recovery=<...>`
- 缺任一标签时不生成占位文案

**Testing**

- 先收紧 `scripts/regression-checks.mjs` 的 markdown report 断言，覆盖 `match` 与 `drift` 两种输出。
- 再更新 `scripts/e2e-report.mjs`，直到完整回归命令恢复通过。
- README 补充 checklist 现已直接显示 drift/match note，避免文档与 CLI 输出漂移。
