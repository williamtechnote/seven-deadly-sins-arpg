# Lust Cadence Artifact Output Design

**Context**

`buildBossAttackCadenceReviewChecklist` 已经能把 `魅惑女妖` phase 3 的 telegraph、shared recovery 与 loopback/bridge 关系整理成可读 checkpoint，但当前 Playwright 证据目录仍只有通用截图与整局 snapshot。复盘 live pacing 时，定位 phase 3 关键时刻仍要手动翻 trace、录像和 state dump。

**Approaches**

1. 在 E2E spec 里直接拼装并写文件。
   最快，但 artifact 结构会散落在单个 spec，CLI 无法单测，后续别的 cadence spec 也难复用。
2. 在 `shared/game-core.js` 增加纯函数产出 cadence artifact bundle，再由 Playwright helper 统一落盘与 attach。
   纯逻辑可直接走 regression checks，E2E 只负责抓 live state 和文件输出，复用性最好。
3. 只依赖 Playwright trace / screenshot，不新增结构化 artifact。
   成本最低，但仍需要手动解读，不满足当前 TODO 的“checkpoint + telegraph 截图 + shared-recovery snapshot”目标。

**Recommendation**

选择方案 2。核心契约放到 `shared/game-core.js`，输出结构化的 checklist、checkpoint label 和 live snapshot 摘要；`tests/e2e/helpers/game-driver.js` 负责把 bundle 写进 `artifacts/e2e/...`，并通过 `testInfo.attach` 挂进 Playwright 报告。

**Artifact Shape**

- `cadence-review.json`
  包含 review checklist、phase/attack labels、telegraph snapshot、shared recovery snapshot。
- `cadence-review.txt`
  面向录屏复盘的纯文本 checkpoint 列表。
- `telegraph-hud.png`
  进入 phase 3 后首个 telegraph HUD 截图。
- `shared-recovery-snapshot.json`
  记录 shared recovery 剩余时间、breather chain 与 loopback 目标。

**Testing**

- 先在 `scripts/regression-checks.mjs` 为新的 artifact bundle 纯函数加失败测试。
- 再更新 `tests/e2e/lust-phase3-cadence.spec.js`，确认 cadence review evidence 会输出 bundle 并继续覆盖现有 telegraph/recovery 对齐断言。
