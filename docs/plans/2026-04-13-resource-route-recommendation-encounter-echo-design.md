# Resource-Route Recommendation Encounter Echo Design

## Context

`祈愿圣坛 / 赌徒圣坛 / 战备商柜` 现在已经有三层 room-3 payoff：

- route baseline anchor 会把 `复苏回拍 / 迅击抢拍 / 豪赌追赏 / 稳押收赏 / 净包稳场 / 狂油抢势` 接进第三房
- 一部分高置信 recommendation reason 也会继续升级成更窄的 encounter echo，例如 `留本追赏` 与 `净化后稳场`
- runtime source cue 会在 routed room-3 的首个关键战斗节点再补一次同一条 why-now 短句

但这里还剩两个明显断层：

- `迅击祷言` 在 panel preview 里已经能读出 `当前局已偏节奏`，却不会成为 recommendation，也不会继续兑现到 routed `高压战`
- `战地净化包` 虽然已经会因为 `当前可负担` 被推荐，但 routed room-3 仍只会读到 baseline `净包稳场`

方法论文档反复强调，choice room 的意义不只是 route identity，还要回答“为什么现在选它”。这批 reason 已经足够高置信，不该停在 panel 或 baseline anchor 之前。

## Options

1. 只补 README / help copy。
Rejected: 会解释得更完整，但玩家在第三房里仍感受不到新增 reason 的兑现。

2. 直接把 `当前局已偏节奏` / `当前可负担` 原文拼进 routed cue。
Rejected: panel reason 太偏状态说明，直接照抄到战斗反馈里会显得生硬。

3. 为这两条 reason 增加 encounter-specific why-now echo。
Recommended: 既保留 compact receipt contract，又能把状态说明翻译成更适合第三房节奏的战斗短句。

## Chosen Direction

补两条显式映射，并保持 shared recommendation-first fallback：

- `tempoPrayer` + `当前局已偏节奏` + `高压战`
  - entry / clear echo: `顺势抢压`
  - source cue moment: `engage`
- `fieldTonic` + `当前可负担` + `缓冲战`
  - entry / clear echo: `趁价备净`
  - source cue moment: `stabilize`

同时把 `当前局已偏节奏` 从 panel preview note 提升为真正的 shared recommendation reason，这样 choice footer、resolved receipt、entry / clear、source cue 才能沿同一条 persisted reason contract 贯通。

## Design Notes

- recommendation 逻辑继续放在 `shared/game-core.js`
- `game.js` 不需要新增 runtime hook，只需继续复用既有 routed entry / clear / source cue helper
- 规则保持显式 per-choice + per-reason 匹配，不做模糊文本启发式
- `当前局已偏节奏` 只在 `祈愿圣坛` 的两选一场景下作为高置信 recommendation 触发；如果 run modifier 没有明显 `节奏` 倾向，则保持静默

## Success Criteria

- `祈愿圣坛` 在 run modifier 明显偏 `节奏` 时会给出 `建议 2：迅击祷言 · 当前局已偏节奏`
- 选中 `迅击祷言` 后，routed `高压战` 会把该 reason 兑现成 `顺势抢压`
- `战地净化包` 在 `当前可负担` 场景下，会把 routed `缓冲战` 从 baseline `净包稳场` 升级成 `趁价备净`
- README、help overlay、regression checks 与 shared helper 一起锁定同一条 deterministic contract
