# 回息修习资源兑现反馈 Design

## Context

`战势圣坛` 的两条路线现在都已经有常驻 HUD identity:

- `回息修习` 会在 `普攻 U` 行显示 `回体+4`
- `借势修习` 已经在兑现命中时补上 `借势重击`

相比之下，`回息修习` 的兑现瞬间仍只靠浮字，资源层没有同步体感，导致“命中转续航”这条路线比“闪避转爆发”更轻。

## Options

1. 只放大 `回体+4` 浮字
Rejected: 仍停留在命中文字层，没有把收益挂到真正被恢复的体力资源上。

2. 给 `回息修习` 再补新的常驻 HUD 标签
Rejected: identity 已经存在，缺的是兑现时刻，而不是常驻辨识度。

3. 当实际回体结算时让体力条同步短促抬亮 / 脉冲
Recommended: 直接复用玩家已经盯着读资源缺口的位置，并且只在真实回体时触发，和 `借势重击` 一样把 payoff 闭环补到命中瞬间。

## Chosen Direction

- 在 shared helper 中新增一个轻量的体力条 pulse presentation 计算，统一管理持续时间、填充亮度与文本高亮
- 敌人 / Boss 命中路径在 `grantAttackHitStamina` 返回真实回体量时才 arm 这段 pulse
- `updateHUD` 渲染体力条时叠加这段短促亮色与轻微宽度外扩；若没有真实回体或玩家已满体，则不触发

## Testing Focus

- shared helper 要锁定 pulse 只在有效时间窗内生效，并给出比基础条体更亮的 alpha / 文本 tint
- runtime source hooks 要锁定敌人 / Boss 两条命中路径都会在 `staminaRefund > 0` 时触发 pulse
- README / TODO 需要把这次 follow-up 记录成 `回息修习` 的 payoff feedback，而不是新的常驻 shrine HUD 项
