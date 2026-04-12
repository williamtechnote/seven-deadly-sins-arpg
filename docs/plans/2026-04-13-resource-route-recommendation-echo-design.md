# Resource-Route Recommendation Echo Design

## Context

`祈愿圣坛 / 战备商柜 / 赌徒圣坛` 现在已经会把 route identity 接进第三房：

- `复苏回拍 / 迅击抢拍 / 豪赌追赏 / 稳押收赏 / 净包稳场 / 狂油抢势`
- `稳押` 在 `当前更宜稳押` 时还能继续升级成 `留本追赏`

但资源路线的 why-now 兑现仍不对称：

- `战地净化包` 已能在 `可净化N层` 时走 shared recommendation echo，却还不能把 `当前可负担` 这种 affordability reason 接进 routed combat
- `复苏祷言 / 迅击祷言` 面板预览已经能读出 route identity，却还没有和 live combat state 对齐的高置信 recommendation，因此 entry / clear / source cue 只能停在 baseline anchor

方法论文档强调 route 不该只回答“这是哪条路线”，还应继续回答“它现在解决什么问题”。因此本轮应把 resource-route reason 继续收束成可验证的 routed combat echo。

## Options

1. 把 choice preview 的所有注记都无差别持久化到 encounter echo。
Rejected: scope 太大，容易把 `高血收益低` / `当前局已偏补给` 这类弱上下文也一并塞进战斗反馈，破坏高置信 contract。

2. 只给 `战地净化包` 增加 `当前可负担` 的 echo。
Rejected: 能补 affordability 缺口，但 `祈愿圣坛` 仍只剩 baseline anchor，资源路线整体仍不对称。

3. 只扩高置信 resource-route recommendation，并把 prayer 路线也接进同一条 persisted-reason contract。
Recommended: 既能保持 shared helper 的 deterministic contract，又能在单次 heartbeat 内同时补齐 prayer / supply 两个 still-missing why-now 缺口。

## Chosen Direction

新增三条 resource-route recommendation reason，并把它们继续兑现到第三房：

- `复苏祷言`：当 live action state 明显更缺体力周转时，choice panel 给出 `当前更缺回体`
- `迅击祷言`：当 live action state 明显更缺特攻周转时，choice panel 给出 `当前更缺特攻`
- `战地净化包`：保留已有 recommendation，且当玩家此刻只能稳定负担 `战地净化包` 时，继续给出 `当前可负担`

这些 persisted reason 在 routed encounter 中进一步压成更短的 why-now echo：

- `复苏祷言 + 当前更缺回体` -> `回体回拍`
- `迅击祷言 + 当前更缺特攻` -> `特攻抢拍`
- `战地净化包 + 当前可负担` -> `备净稳场`

已有更强的资源 recommendation echo 继续优先：

- `可净化N层` 仍优先映射到 `净化后稳场`
- `当前更宜稳押` 仍优先映射到 `留本追赏`

## Design Notes

- 共享 recommendation 与 encounter echo 仍收敛在 `shared/game-core.js`
- `game.js` 不需要新增 scene-level hook；现有 persisted recommendation、entry / clear / source cue contract 已足够复用
- prayer recommendation 必须保持保守，只在 one-sided bottleneck 场景下发声，避免把资源路线做成另一个嘈杂 action-helper
- README 只补一句新的 why-now 例子，避免路由段落继续失控增长

## Success Criteria

- `祈愿圣坛` 在高置信 stamina/special bottleneck 下能给出 compact recommendation，并把 reason 持久化进 resolved receipt
- `战地净化包` 在“可买但另一条更贵”的场景下能把 `当前可负担` 持久化并兑现到第三房
- entry / clear / source cue 会分别读出 `回体回拍 / 特攻抢拍 / 备净稳场`
- `可净化N层` 与 `当前更宜稳押` 这些现有更强 reason 仍保持优先，不回退成更泛的 echo
- regression checks 与 README 一起锁定同一条 contract
