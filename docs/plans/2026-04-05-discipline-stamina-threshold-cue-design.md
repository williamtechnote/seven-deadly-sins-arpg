# 游步修习资源条临界提示 Design

## Context

`游步修习` 已经会在 `闪避 Space` 真正转好时短促切成 `游步就绪`，但 payoff 仍主要停在行动行文字。玩家真正盯着判断“现在能不能翻滚”的位置仍是左上体力条，所以当减耗刚好把闪避从差体或翻滚后的下一状态推回 ready 时，资源条也需要同步给一拍轻提示，才能把这条 dodge-economy route 的收益挂到资源读数本身。

## Options

1. 只保留 `游步就绪` 文字 cue
Rejected: 文字 cue 已存在，这次缺的是资源层的同步兑现。

2. 给 `游步修习` 单独做一套新的体力条表现
Rejected: repo 已有共享 `stamina payoff pulse`，再造一套只会扩大维护面。

3. 复用现有体力条 payoff pulse，只在减耗真正跨过 dodge 门槛时触发
Recommended: 沿用共享资源反馈路径，并用“当前体力只够折后 cost、不够原始 cost”锁定触发条件，避免把纯 cooldown ready 误报成体力 payoff。

## Chosen Direction

- 保留现有 `游步就绪` 行动行 cue，不改其更宽的 blocked-to-ready 触发范围
- 在 `UIScene.updateHUD()` 的 dodge ready edge 上，只有上一帧 dodge 行仍是 `差体` 或 `翻滚中 -> ...` 这类体力相关/翻滚后预告，且当前体力只因 `游步修习` 的减耗才够翻滚时，才同步 `armStaminaPayoffPulse(1)`
- 不新增新的 UI presentation helper；继续复用现有体力条亮色 overlay 与文本提亮
- README / Help / TODO / regression checks 同步改成“`游步就绪` + 资源条临界 cue”这一版 contract

## Testing Focus

- regression source hook 要锁定 `游步修习` 只在“折后 cost 可用、原始 cost 不可用”时才 arm 体力条 pulse
- docs copy 要锁定 `游步就绪` 之外还会同步抬亮体力条
- 既有 `复苏祷言` 与 `回息修习` 的 stamina pulse contract 不应回退
