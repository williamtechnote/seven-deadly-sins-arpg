# 复苏祷言体力兑现反馈 Design

## Context

`祈愿圣坛` 现在已经把两条路线都钉进了行动 HUD：

- `复苏祷言` 常驻显示 `复苏+35%`
- `迅击祷言` 常驻显示 `迅击-22%`

`迅击祷言` 也已经在 `特攻 O` 真正转好时补上 `迅击就绪`。相比之下，`复苏祷言` 仍只有常驻标签，玩家在自然回体重新跨过闪避门槛时，只会看到普通的 `就绪` 切换，读不出这是本局 prayer route 带来的 payoff。

## Options

1. 只复用通用 ready flash
Rejected: 仍然读不出这次 ready 边界来自 `复苏祷言` 的体力恢复收益。

2. 给体力条新增常驻 prayer UI
Rejected: 这次缺的是临界兑现瞬间，而不是 route identity；新增模块会破坏当前“继续复用行动行”的方向。

3. 让 `闪避 Space` 在自然回体真正推回 ready 时短促切成 `复苏就绪`
Recommended: 继续复用现有 ready flash 与玩家已在看的 dodge 行，只在 payoff 边界上补一拍 route-specific cue。

## Chosen Direction

- 保留 `复苏+35%` 作为常驻 route identity
- 当 `闪避 Space` 从 `差体/预告` 真正切回 ready，且当前 run 拥有 `复苏祷言` 时，短促切成 `复苏就绪`
- 只有之前的 dodge 行确实还在显示 stamina-gap 或 post-roll stamina preview 时才 arm cue，避免把纯 cooldown 结束误报成 prayer payoff
- 若 `游步修习` 的 dodge-economy 标签存在，仍优先显示 `游步-20%/-18%`

## Testing Focus

- combat HUD summary helper 要锁定 `复苏就绪` 标签能在 dodge 行正常拼接
- source hooks 要锁定 `getCombatDodgeStatusLabel(now)` 只在 dodge 真正 ready 时显示 `复苏就绪`
- `UIScene.updateHUD()` 要锁定 dodge cue 只会在上一帧包含 `差体/预告` 时从 ready edge arm
- README / Help / TODO 要把这次工作记录成 `复苏祷言` 的 payoff cue，而不是新的常驻标签
