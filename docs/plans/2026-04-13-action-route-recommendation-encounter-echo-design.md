# Action-Route Recommendation Encounter Echo Design

## Context

`战技 / 镇压 / 战势 / 连携 / 反击` 这批行动型 blessing route 现在已经有三层读图：

- choice panel 会给出 `普攻卡拍 / 闪避卡拍 / 当前更宜控场 / 特攻待借势 / 特攻待连段 / 闪避待回身 / 可立即追猎 / 当前更缺回体`
- 结算后的 HUD / 世界标签会保留同一条 compact reason receipt
- 第三房 entry / clear / source cue 也会给出 route baseline anchor，例如 `连斩抢拍 / 游步整拍 / 镇步控场`

但这里仍有一处断层：当 route 本身就是因为当前战斗瓶颈才被推荐时，下一房仍只会读到 baseline identity，看不出“为什么是现在”。方法论文档强调高 ROI TODO 应让玩家在 30 秒内感到下一次战斗决策真的被刚才的选择改写，因此这里更强的方向不是再加 panel 脚注，而是把高置信 action reason 接进 routed combat。

## Options

1. 继续只保留 action baseline anchor。
Rejected: route identity 能读懂，但 recommendation judgement 断在选前，和资源/build 路线已经建立的 contract 不一致。

2. 把 action recommendation 原文直接拼到所有 routed cue。
Rejected: 原文并不总等于 encounter 语言，直接照抄会把 `特攻待借势` 这类 panel reason 生硬贴进 entry / clear copy。

3. 为 action recommendation 增加一层更窄的 encounter echo / source cue 映射。
Recommended: 既能保留 baseline anchor 兜底，也能把高置信 recommendation 翻译成更适合第三房节奏的战术短句。

## Chosen Direction

为已有 action recommendation 增加一层 encounter-specific override，只在 persisted reason 与 routed profile 仍强相关时触发：

- `连斩修习` + `普攻卡拍` + `高压战` -> `抢拍开刃`
- `游步修习` + `闪避卡拍` + `缓冲战` -> `游步回拍`
- `镇步修习` + `当前更宜控场` + `缓冲战` -> `先控稳场`
- `破势修习` + `当前可追终结` + `淘金战` -> `破势收赏`
- `回息修习` + `当前更缺回线` + `缓冲战` -> `回线稳场`
- `借势修习` + `特攻待借势` + `高压战` -> `借势抢压`
- `催锋修习` + `特攻待连段` + `高压战` -> `连段催锋`
- `回身修习` + `闪避待回身` + `缓冲战` -> `回身整拍`
- `追猎修习` + `可立即追猎` + `淘金战` -> `追猎收赏`
- `调息修习` + `当前更缺回体` + `缓冲战` -> `调息回线`

这些 echo / source cue 应继续走已有 shared ladder：

- recommendation-specific echo first
- baseline route anchor second

这样高置信场景会读到更窄的 why-now 战术短句，而弱场景仍能回到稳定的 baseline contract。

## Design Notes

- 共享逻辑继续收敛在 `shared/game-core.js`
- `game.js` 的 runtime hook 不需要新增数据流，只需继续复用既有 entry / clear / source cue helper
- 规则保持显式 per-choice + per-reason 匹配，不做模糊文本启发式
- README / help overlay 只需要补一段说明 action recommendation 已会继续兑现到第三房

## Success Criteria

- action-route 的高置信 persisted reason 能在 routed room-3 entry / clear / source cue 中读成更窄的战术短句
- 同一路线在没有 matching recommendation receipt 时仍回退到既有 baseline anchor
- 现有资源/build/threshold recommendation echo contract 不回归
- README / help overlay / regression checks 一起锁到同一条 deterministic contract
