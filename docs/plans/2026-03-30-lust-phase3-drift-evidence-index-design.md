# Lust Phase 3 Drift Evidence Index Design

**Context**

`npm run e2e:report` 现在会在 `Phase 3 录屏复盘清单` 顶部显示 `match/drift` 汇总，并在每条 checkpoint 行追加 `[review] [checkpoints] [recovery] [telegraph]` anchor。但当 phase 3 汇总点出 drift checkpoint 后，复盘者仍要继续往下滚到对应 checkpoint 行才能跳转到证据。当前 active TODO 要求把 drift 汇总本身补成可点击的证据索引。

**Approaches**

1. 只保留 drift checkpoint 名单。
   成本最低，但仍然要继续下滑找证据，不满足 TODO 目标。
2. 在 `scripts/e2e-report.mjs` 生成汇总行时，直接把统一 evidence anchor 拼到 drift 汇总后面，并用回归测试锁定输出。
   复用现有 markdown 结构，改动最小，也最适合当前 heartbeat 节奏。
3. 为每个 drift checkpoint 生成单独 anchor 列表。
   可读性更强，但当前 artifact 是整组共享证据文件，先补统一 evidence anchor 更符合现有数据结构。

**Recommendation**

选择方案 2。让 phase 3 drift 汇总 header 直接附上 `[review] [recovery] [telegraph]` anchor：
- summary header 继续保留 `match/drift` 统计和 drift checkpoint 名单
- 仅在存在 drift 时追加 evidence anchor，避免无漂移时噪音过多
- 复用现有相对路径与 markdown link helper，保持 checkpoint 行与 summary header 的证据入口一致

**Testing**

- 先在 `scripts/regression-checks.mjs` 增加失败断言，要求 summary header 的 drift 行包含 `[review] [recovery] [telegraph]` anchor。
- 再实现 `scripts/e2e-report.mjs` 的汇总渲染逻辑，复跑回归确认新断言通过，且既有 checkpoint 行格式不回退。
