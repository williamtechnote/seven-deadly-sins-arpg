# Lust Phase 3 Cadence Summary Design

**Context**

`npm run e2e:report` 现在已经会把 `魅惑女妖` phase 3 的 checkpoint 行、recovery 快照和 artifact anchor 编排成 markdown 清单，但复盘者仍要逐条人工扫 `回切校验: match/drift` 才能判断当前 artifact 是否整体健康。Active TODO 要求在 `Phase 3 录屏复盘清单` 顶部再补一段 phase 3 汇总 header，直接统计 `match/drift` 数量并点名发生漂移的 checkpoint。

**Approaches**

1. 只在 README 解释如何人工统计。
   成本最低，但没有真正缩短排查路径，也不会被回归脚本保护。
2. 在 `scripts/e2e-report.mjs` 内基于现有 checkpoint/recovery 数据生成 summary header，并由 `scripts/regression-checks.mjs` 锁定输出。
   复用现有 markdown 流程，改动最小，也最贴合当前 TODO。
3. 把 summary 逻辑塞回 Playwright artifact 生成阶段。
   可行，但 summary 是报告层展示逻辑，不必让测试产物承担额外格式职责。

**Recommendation**

选择方案 2。让 `scripts/e2e-report.mjs` 在渲染 `Phase 3 录屏复盘清单` 时额外生成一段 summary header：
- 汇总 `回切校验` 的 `match` / `drift` 数量
- 列出 drift checkpoint 名单
- 在没有 recovery 对照数据时保持静默，不污染其他 artifact section

**Testing**

- 先在 `scripts/regression-checks.mjs` 为 markdown 输出加失败断言，要求 summary header 包含 `match/drift` 统计和 drift checkpoint 名单。
- 再实现报告逻辑，复跑同一条回归，确认既有 checkpoint 行输出不回退。
