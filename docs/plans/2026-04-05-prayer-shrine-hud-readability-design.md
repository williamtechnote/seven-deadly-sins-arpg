# 祈愿圣坛 HUD 可读性 Design

## Context

`祈愿圣坛` 已经能改变本局 `体力恢复 +35%` 或 `特攻冷却 -22%`，但这两条路线目前仍只存在于事件房摘要与底层数值里。进入战斗后，行动 HUD 不会像 `战技圣坛 / 战势圣坛` 那样持续暴露当前 run identity。

## Options

1. 继续只靠右侧事件房摘要
Rejected: 战斗时主视线仍会回到左下行动 HUD，这条路线无法做到“边打边读”。

2. 新增 shrine 专属 HUD 模块
Rejected: 会额外占用布局空间，也违背当前 repo 优先复用 `普攻 / 特攻 / 闪避` 三条行动行的原则。

3. 把 prayer identity 钉进行动 HUD
Recommended: `迅击祷言` 直接映射到 `特攻 O`，`复苏祷言` 映射到最常体现体力等待成本的 `闪避 Space`，无需新增 UI 模块即可持续暴露路线差异。

## Chosen Direction

- `迅击祷言` 生效时，`特攻 O` 行常驻追加 `迅击-22%`
- `复苏祷言` 生效时，`闪避 Space` 行常驻追加 `复苏+35%`
- 两条标签在翻滚锁定预告里也要继续保留，保持与现有 shrine HUD contract 一致

## Testing Focus

- HUD helper 需要覆盖 prayer 标签在 ready 状态下的常驻输出
- HUD helper 需要覆盖 prayer 标签在翻滚预告里的保留行为
- Runtime source hooks 需要锁定 `getCombatSpecialStatusLabel()` / `getCombatDodgeStatusLabel()` 对应的 run-effect 取值路径
