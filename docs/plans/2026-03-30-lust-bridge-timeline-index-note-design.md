# Lust Bridge Timeline Index Note Design

**Context**

`scripts/e2e-report.mjs` 已经会把 `cadence-review.json`、`phase3-checkpoints.txt`、`shared-recovery-snapshot.json` 与 `telegraph-hud.png` 串成 markdown 版 `Phase 3 录屏复盘清单`。当前 drift-only mini checklist 已带 `review checkpoint #n` 与 bridge/loopback alias short note，但复盘者仍要重新打开 `cadence-review.json` 才能知道该条 drift 具体落在 `bridgeTimeline` 的哪一段索引。

**Approaches**

1. 在 phase 3 汇总 header 里统一追加 bridge span 摘要。
   改动最小，但 drift row 仍缺少逐条上下文。
2. 在 drift-only mini checklist 每条 row 内联 `bridgeTimeline` index short note。
   信息靠近问题点，最适合快速扫读。
3. 直接把完整 `bridgeTimeline` 展开到 drift row。
   细节最全，但 checklist 会变得过长。

**Recommendation**

选择方案 2。对每条 drift row 只补一个短 note，优先暴露 `bridgeStartIndex`、`bridgeEndIndex` 与首尾 timeline token；这样可以快速定位 bridge span，又不会把整段 timeline 全塞进 checklist。

**Formatting Rules**

- 有效 span 时输出 `bridgeTimeline index: \`<start>-<end> (<first> -> <last>)\``
- 只有单点索引时输出 `bridgeTimeline index: \`<index> (<token>)\``
- 缺少索引或 timeline 时不输出占位文案

**Testing**

- 先修改 `scripts/regression-checks.mjs` 的 markdown report 断言，让 drift-only mini checklist 必须出现 bridgeTimeline index short note。
- 再更新 `scripts/e2e-report.mjs`，直到回归重新通过。
- README 补充 drift-only mini checklist 现已直接显示 bridge span 索引短注记，避免文档与 CLI 输出漂移。
