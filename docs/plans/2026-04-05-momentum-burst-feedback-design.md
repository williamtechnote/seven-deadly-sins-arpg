# 借势修习爆发命中反馈 Design

## Context

`战势圣坛` 与另外两座战斗圣坛一样，已经把 route identity 钉进常驻行动 HUD。但当前 `借势修习` 仍只在两个前置瞬间可读：

- 未触发时，`特攻 O` 显示 `借势待闪`
- 触发后，`特攻 O` 显示 `借势1.6s`

真正把窗口兑现成强化特攻命中时，画面反馈仍与普通特攻几乎一致，玩家很难在命中当下确认“这一下就是借势爆发”。

## Options

1. 继续只依赖 HUD 倒计时
Rejected: 能读到窗口存在，但兑现瞬间仍缺命中确认，战斗手感没有被放大。

2. 给 `借势修习` 再补一层常驻 HUD 文案
Rejected: 属于重复 shrine identity 工作，收益低，也会继续挤压已有行动行。

3. 给借势特攻补独立命中反馈
Recommended: 在兑现瞬间用更明确的 hit pulse / 浮字把“闪避转爆发”闭环补齐，既提升 combat feel，也让 run identity 从准备态延伸到命中态。

## Chosen Direction

- 当 `借势修习` 的强化窗口被特攻消耗时，把该 hitbox 标记为 `isEmpoweredSpecial`
- 命中普通敌人与 Boss 时，借势特攻改用更醒目的爆发脉冲与 `借势重击` 浮字
- 普通特攻仍保留现有 `重击 / 破势 / 破招` 反馈，避免把所有 special 都抬成同一层级

## Testing Focus

- 回归需要锁定运行时代码会把 post-dodge multiplier 兑现为 empowered special 标记
- 普通敌人与 Boss 两条命中路径都要锁定 `借势重击` 反馈
- README / TODO 需要把这次 follow-up 记录成“payoff feedback”而不是新的 shrine HUD 标签
