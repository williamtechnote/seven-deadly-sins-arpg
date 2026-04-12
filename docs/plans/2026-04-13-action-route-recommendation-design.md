# Action-Route Recommendation Design

## Context

`战技 / 战势 / 连携 / 反击` 这些行动型 blessing route 已经有三层可读性：

- choice row 里能读到路线本身
- HUD / 命中 payoff 能读到 route identity
- 第三房 routed encounter 能通过 baseline anchor 继续读到 `连斩抢拍 / 借势重击 / 催锋连段 / 追猎追赏`

但高置信 recommendation 还主要停在静态 context：

- 血线阈值
- 当前武器类型
- 当前武器附带的异常状态
- 净化 / 金币可负担

这会让行动型路线在“选前比较”这一步仍偏弱。玩家已经能从行动 HUD 读到“现在是普攻卡冷却、闪避差体力、特攻卡冷却、刚好能接闪后特攻”，但 choice panel 并不会把这些 live action-state 收束成 recommendation。

## Options

1. 继续只扩更多选后 / 进房文案。
Rejected: route payoff 会更长，但 choice panel 依然没有更快的决策结论。

2. 给 action-route recommendation 接入 live action-state snapshot。
Recommended: 直接复用当前 HUD 已在读的 cooldown / stamina / action-ready 语义，把 recommendation 提前到选择前，同时保留选后 persisted reason -> encounter echo 的闭环。

3. 重做 choice panel 排序或改成更重的评分 UI。
Rejected: 会破坏现有 `1 / 2` 稳定顺序，也超出本轮 heartbeat 的范围。

## Chosen Direction

做一轮保守但高置信的 action-route recommendation 首批扩展：

- `战技圣坛`
  - `连斩修习`：当普攻正卡冷却、而闪避不构成主要瓶颈时推荐 `普攻正卡冷却`
  - `游步修习`：当闪避正卡冷却或正差体力、而普攻不构成主要瓶颈时推荐 `闪避正卡冷却` / `闪避正差体`
- `战势圣坛`
  - `回息修习`：当前明显更缺体力时推荐 `当前更缺体力`
  - `借势修习`：当前已经具备 `闪避 -> 特攻` 爆发接法时推荐 `可接闪特爆发`
- `连携圣坛`
  - `催锋修习`：当特攻正卡冷却、而普攻已能稳定接段时推荐 `特攻正卡冷却`
  - `回身修习`：当闪避正卡冷却或差体力、而特攻已能稳定打出时推荐 `闪避正卡冷却` / `闪避正差体`
- `反击圣坛`
  - `追猎修习`：当前已经具备 `闪避 -> 普攻` 追击接法时推荐 `可接闪后追击`
  - `调息修习`：当前明显更缺体力时推荐 `当前更缺体力`

当这些 recommendation 被选中后，第三房 entry / clear / source cue 不再只落 baseline anchor，而会升级成对应的 route-specific encounter echo。

## Design Notes

- `game.js` 只负责把当前 action-state snapshot 传进 shared helper：
  - `attack/special/dodge` cooldown
  - 当前体力 / 体力上限
  - 当前武器的 attack / special / dodge stamina cost
- `shared/game-core.js` 继续做 source of truth：
  - choice row 上的 action-state notes
  - footer recommendation decision
  - persisted reason 与 routed encounter echo 的映射
- recommendation 仍保持保守：
  - 只有当一条路线明显承接当前 action bottleneck 或当前可兑现连段时才出脚注
  - 不强行覆盖模糊状态

## Success Criteria

- choice panel 能在高置信 action-state 下补出 `建议 1/2：连斩修习 · 普攻正卡冷却`、`建议 2：借势修习 · 可接闪特爆发` 这类脚注
- 对应 choice row 也会补 action-state note，和 footer recommendation 读同一套语义
- 玩家选中这些 recommendation 后，第三房 entry / clear / source cue 会落 route-specific encounter echo，而不只是 baseline anchor
- regression checks、README、TODO、help overlay 保持同一条 contract
