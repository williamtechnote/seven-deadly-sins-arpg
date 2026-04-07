# 复苏祷言资源条临界提示 Design

## Context

`复苏祷言` 已经会在 `闪避 Space` 真正转好时短促切成 `复苏就绪`，但 payoff 仍主要停留在行动行文字。玩家真正盯着读“能不能翻滚”的位置还是左上体力条，所以当自然回体刚好跨过门槛时，资源条也需要同步给一拍轻提示，才能把这条 prayer route 的收益挂到资源读数本身。

## Options

1. 只保留 `复苏就绪` 文字 cue
Rejected: 现在缺的正是资源层的同步兑现，文字 cue 已经存在。

2. 为 `复苏祷言` 单独做一套新的体力条表现
Rejected: 当前 repo 已有 `回息修习` 使用的体力条 payoff pulse，另起一套 presentation 会增加维护面而收益有限。

3. 复用现有体力条 payoff pulse，在 prayer threshold edge 上同步触发
Recommended: 继续沿用共享资源反馈路径，只把触发条件锁在“上一帧仍是 dodge stamina gap / preview，本帧刚切回 ready”这一拍，保证 cue 只在真实跨门槛时出现。

## Chosen Direction

- 保留现有 `复苏就绪` 行动行 cue，不改 route priority
- 在 `UIScene.updateHUD()` 的 dodge-ready edge 上，如果上一帧 dodge 行仍包含 `差`，则同时 arm `armPrayerDodgeReadyCue()` 与共享 `armStaminaPayoffPulse(1)`
- 不新增新的 shared helper；沿用现有体力条亮色 overlay 与文本提亮，保持实现范围收敛
- README / Help / TODO 同步改成“文字 cue + 资源条临界 cue”这一版 contract

## Testing Focus

- regression source hook 要锁定 prayer dodge-ready edge 会同步 arm stamina-bar pulse
- README / Help copy 要锁定“复苏就绪”之外还会同步抬亮体力条
- 既有 `回息修习` 的体力条 payoff pulse contract 不应回退
