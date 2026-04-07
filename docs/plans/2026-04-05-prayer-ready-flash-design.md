# 迅击祷言冷却兑现反馈 Design

## Context

`祈愿圣坛` 目前已经把两条路线钉进战斗 HUD：

- `复苏祷言` 常驻显示 `复苏+35%`
- `迅击祷言` 常驻显示 `迅击-22%`

但和 `回息修习` / `借势修习` 相比，`迅击祷言` 仍只有常驻 identity，没有兑现瞬间的短促 cue。玩家知道这条路线存在，却缺少“这一拍真的转好”的闭环。

## Options

1. 只增强现有通用 ready flash
Rejected: 所有动作共用同一 flash，读不出这是 `迅击祷言` 带来的 route payoff。

2. 新增独立 shrine UI 或额外冷却条
Rejected: 超出当前 HUD lane，违反 repo 现有“复用动作行而不是再造一套 shrine meter”的方向。

3. 在 `特攻 O` 真正转好时短促切成 `迅击就绪`
Recommended: 继续复用玩家已经盯着看的行动行，与现有 ready flash 同步触发，不引入新 UI。

## Chosen Direction

- 保留 `迅击-22%` 作为常驻 route identity
- 当 `特攻 O` 从不可用边界真正切进 `就绪`，且当前 run 拥有 `迅击祷言` 时，短促切成 `迅击就绪`
- 若同时存在更高优先级的 `借势` 临时窗口，仍优先显示 `借势` 相关文案

## Testing Focus

- source hooks 要锁定 prayer-ready cue 只会从真实 special-ready 边界 arm
- `getCombatSpecialStatusLabel(now)` 要锁定 `借势` 优先级高于 `迅击就绪`
- README / Help / TODO 要把这次工作记录成 `祈愿圣坛` payoff cue，而不是新的常驻标签
