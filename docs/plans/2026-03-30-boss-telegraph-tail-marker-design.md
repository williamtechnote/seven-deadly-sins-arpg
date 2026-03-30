# Boss Telegraph Tail Marker Design

## Goal

当 Boss 的 `反制窗口` 实际收尾晚于 telegraph 进度条本体时，在进度条终点补一枚稳定可见的 `超出尾标`，避免玩家把进度条清空误读成“可反制窗口也已经结束”。

## Approach

沿用现有 `buildBossTelegraphHudSummary` 和 BossScene telegraph HUD 渲染链，不新建额外 UI 文本，也不改 Boss 攻击数据。共享 helper 负责判断 `counterWindowStartOffsetMs + counterWindowMs` 是否超出 `telegraphDurationMs`，并暴露一个轻量布尔态给 BossScene。

BossScene 只在该布尔态为真时，于 telegraph 条末端补一枚窄小但高对比的尾标，让玩家在 HUD 仍显示期间就知道“条本体结束后，窗口还会再拖一点点”。README / 操作指引 / 回归检查同步锁住这个读招提示。

## Testing

- 先在 `scripts/regression-checks.mjs` 中补失败断言，要求 shared helper 暴露 overflow 标记，并要求 BossScene 源码实际绘制 tail marker。
- 完成实现后运行仓库规定的四条检查命令，确认 shared helper、HUD 渲染和文档说明保持一致。
