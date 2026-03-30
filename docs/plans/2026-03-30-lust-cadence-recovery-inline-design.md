# Lust Cadence Recovery Inline Snapshot Design

**Context**

`scripts/e2e-report.mjs` 已经会把 `cadence-review.json`、`phase3-checkpoints.txt`、`shared-recovery-snapshot.json` 与 `telegraph-hud.png` 串成 markdown 版 `Phase 3 录屏复盘清单`，但 checkpoint 行目前只显示 `回切目标` 与 artifact anchor。排查 live pacing 时仍要逐条点开 `shared-recovery-snapshot.json` 才能看到 recovery 剩余时间与 breather 链状态。

**Approaches**

1. 只在 markdown 尾部追加一段共享 recovery 摘要。
   改动最小，但阅读 checkpoint 时仍要在列表与摘要之间来回跳。
2. 在每条 checkpoint 行直接内联 recovery snapshot short note。
   会重复一段短信息，但每条复盘项都能直接看到 `sharedRecoveryRemainingMs`、`breatherRemaining` 与 `expectedReturnLabel`，最符合当前 TODO。
3. 把完整 recovery JSON 展开成多行 markdown block。
   信息最全，但会让 checklist 失去扫描性。

**Recommendation**

选择方案 2。`scripts/e2e-report.mjs` 增加一个短 note formatter，把 snapshot 压成 `recovery 快照` 行内短句；优先使用 artifact 中的 `sharedRecoverySnapshot`，仅在缺字段时回退到 checkpoint / shared fallback label。

**Formatting Rules**

- short note 只包含三类信息：`sharedRecoveryRemainingMs`、`breatherRemaining`、`expectedReturnLabel`
- 单行内联，保持 markdown checklist 可扫描
- 缺字段时仅省略该片段，不生成占位词

**Testing**

- 先更新 `scripts/regression-checks.mjs` 的 markdown report 断言，让输出必须包含 recovery snapshot short note。
- 再修改 `scripts/e2e-report.mjs` 直到回归检查通过。
- README 补充新的 markdown checklist 行内 recovery note，避免文档与输出漂移。
