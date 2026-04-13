# Action-Route Context Recommendation Design

## Context

`战技 / 镇压 / 战势 / 连携 / 反击` 这批行动型 blessing route 现在已经能在 HUD、命中 payoff 与第三房 routed encounter 里读出身份，但事件房 choice panel 的 shared recommendation helper 仍只覆盖 `净化 / 血线阈值 / 武器类型 / 异常路线 / 金币阻塞` 这些更静态的上下文。

这会留下一个断层：

- action route 已经会改写下一房节奏
- HUD 也已经能把 route payoff 读出来
- 但玩家在做选择前，还看不到“此刻到底是哪一个动作瓶颈更值得修”

方法论文档强调 choice room 应该回答“当前这条路线解决什么问题”，而不是只提供更多标签。因此下一步不该继续堆描述文案，而是把 live combat bottleneck 直接压进 recommendation helper。

## Options

1. 只给行动型 route 增加更多 per-option 注记。
Rejected: 信息会更多，但玩家仍要自己比较两行，没把结论前移。

2. 让 action route 也直接改动 1/2 的显示顺序。
Rejected: 会破坏按钮顺序的稳定性，也会让现有 `建议 1/2` contract 失去意义。

3. 复用 shared recommendation helper，并把 live combat state 接进去。
Recommended: 既保留现有 choice panel contract，又能让动作型路线第一次在“做选择前”就给出强结论。

## Chosen Direction

为 shared recommendation helper 增加一层 action-context scoring，只在高置信场景下返回 recommendation：

- `战技圣坛`
  - `连斩修习`：当普攻恢复明显慢于闪避时，补 `普攻卡拍`
  - `游步修习`：当闪避恢复明显慢于普攻时，补 `闪避卡拍`
- `镇压圣坛`
  - `镇步修习`：当前更需要稳场/控场时，补 `当前更宜控场`
  - `破势修习`：当前节奏允许追击终结时，补 `当前可追终结`
- `战势圣坛`
  - `回息修习`：当前更缺体力回线时，补 `当前更缺回线`
  - `借势修习`：闪避 ready 但特攻仍待兑现时，补 `特攻待借势`
- `连携圣坛`
  - `催锋修习`：普攻 ready 且特攻是当前瓶颈时，补 `特攻待连段`
  - `回身修习`：特攻 ready 且闪避是当前瓶颈时，补 `闪避待回身`
- `反击圣坛`
  - `追猎修习`：当闪避后可立即接普攻兑现时，补 `可立即追猎`
  - `调息修习`：当当前更缺特攻后的体力回补时，补 `当前更缺回体`

这些 reason 既用于底部 `建议 1/2` footer，也应沿用到选后已存储的 recommendation receipt，这样 HUD / 世界标签 / 结算浮字仍能继续读出同一条 reason。

## Design Notes

- 共享逻辑仍放在 `shared/game-core.js`。
- `game.js` 需要把 choice panel 预览时的 live action state 一起传给 shared helper；结算时也要传同一批字段，保证 recommendation receipt 与选前一致。
- 推荐规则必须保守，宁可沉默也不要乱猜。
- 不要解析 HUD 文案字符串；直接用冷却、体力、回复速度和动作是否 ready 这些数值来判断。

## Success Criteria

- action-route shrines 能在明显的 live combat bottleneck 下产出 `建议 1/2：...` footer。
- 这些 recommendation reason 会在选后按现有 compact receipt contract 被保留下来。
- 模糊场景继续保持静默，不制造弱 recommendation。
- README / help overlay / regression checks 一起锁定新的 choice-panel contract。
