# Resource-Route Encounter Anchors Design

## Context

`祈愿圣坛 / 赌徒圣坛 / 战备商柜` 已经会把下一房导向 `下间缓冲 / 下间高压 / 下间淘金`，但真正进到第三房时，玩家读到的仍主要是 profile-level 通用短句：

- `缓冲战 · 双拍缓冲`
- `高压战 · 三向成压`
- `淘金战 · 后排赏金`

这意味着 build/action blessing route 已经能把“这条路线的身份”接到第一拍交手里，resource / settlement route 却还停留在“这是一种房型强度”。方法论文档强调 route 应该回答“这条路线现在解决什么问题”，而不只是先给一个 generic 房型标签。

## Options

1. 继续让 resource route 只显示 generic encounter profile。
Rejected: 房型能读懂，但 route identity 仍然不落地，和最近 action/build route 的 contract 不一致。

2. 给 choice panel 再加更多脚注或 recommendation。
Rejected: 问题不在选前，而在选后进房后的 identity 断层；只加脚注会继续把信息堆在同一面板。

3. 扩 shared baseline anchor ladder 到 prayer / gambler / supply routes，并只在 persisted reason 仍强相关时补更窄的 override。
Recommended: 既能让 entry / clear / source cue 继续走同一条 shared contract，也能避免把 affordability/run-bias 一股脑全塞进 routed combat。

## Chosen Direction

为 shared encounter baseline feedback 增加六条 resource-route anchor：

- `复苏祷言` -> `缓冲战` -> `复苏回拍`
- `迅击祷言` -> `高压战` -> `迅击抢拍`
- `豪赌` -> `淘金战` -> `豪赌追赏`
- `稳押` -> `淘金战` -> `稳押收赏`
- `战地净化包` -> `缓冲战` -> `净包稳场`
- `狂战补给` -> `高压战` -> `狂油抢势`

同时补一条 recommendation-specific override：

- `稳押` 在 selected recommendation reason 为 `当前更宜稳押` 且 routed profile 仍是 `淘金战` 时，把 baseline `稳押收赏` 升级成 `留本追赏`

其余规则保持保守：

- 已有更强的 recommendation echo 继续优先于 baseline，例如 `血线够追赏`、`净化后稳场`
- 本次不新增 prayer / supply choice-panel recommendation 规则
- affordability / run-bias note 只有在已经被持久化且仍能直接解释 routed combat 时才允许进入 encounter echo；本轮只增加 `稳押` 这一条

## Design Notes

- 共享逻辑继续收敛在 `shared/game-core.js`
- `game.js` 运行时 entry / clear / source cue hook 不需要改动数据流，只需同步 help overlay 文案
- README 需补上 resource-route anchor 的例子，避免文档仍只覆盖 blessing route

## Success Criteria

- `祈愿圣坛 / 赌徒圣坛 / 战备商柜` 的 six routes 会在 routed room-3 entry / clear / source cue 中带出各自 baseline anchor
- `稳押` 的 persisted recommendation reason `当前更宜稳押` 会把 routed cue 升级成 `留本追赏`
- 现有 recommendation-specific cues 仍优先于 baseline anchor，不回退成更泛的 route identity
- README / help overlay / regression checks 一起锁到同一条 contract
