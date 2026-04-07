# 烙痕圣坛 Design

## Context

事件房已经覆盖了 cadence、follow-up、weapon-routing 与 risk/reward，但 `TODO.md` 仍明确指出异常状态 / status-routing 还没有独立房间。仓库现成的玩家异常状态入口也已经足够稳定：武器特攻会附带 `burn / bleed / slow`，命中后已有状态浮字、光环与 tick 逻辑。

## Problem

当前 run 仍不会把玩家明确导向“围绕哪一种异常状态构筑这一局”。现有 burn / bleed 只作为武器特攻附带效果存在，没有被事件房读成路线 identity，也没有 route-specific 的 HUD / payoff cue。

## Options

1. 做一个 slow/control 房间。
Rejected: `slow` 主要是控制收益，HUD 可读性与即时 payoff 都弱于 burn / bleed。

2. 做一个 burn-vs-bleed 的异常状态房间。
Recommended: burn / bleed 已经有清晰 tick、伤害来源与武器入口，适合在一个 heartbeat 内直接做出可读的路线 identity。

3. 引入新的异常状态。
Rejected: 超出当前 heartbeat 范围，也会引入额外平衡与 UI 成本。

## Chosen Direction

新增 `烙痕圣坛`：

- `余烬修习`：本局灼烧持续时间 +45%，灼烧伤害 +30%
- `血痕修习`：本局流血持续时间 +40%，流血伤害 +25%

## Design Notes

- 共享逻辑负责新增 room definition 与 4 个 run-effect keys：
  - `playerBurnStatusDurationMultiplier`
  - `playerBurnStatusDamageMultiplier`
  - `playerBleedStatusDurationMultiplier`
  - `playerBleedStatusDamageMultiplier`
- 运行时不新增新的状态系统，只在玩家 special hitbox 生成时放大匹配状态的 `durationMs` 与 `sourceDamage`。
- HUD 继续复用 `特攻 O`：
  - burn 路线显示 `余烬+45%/+30%`，不匹配武器时显示 `余烬切灼烧`
  - bleed 路线显示 `血痕+40%/+25%`，不匹配武器时显示 `血痕切流血`
- 真正 payoff 发生在异常状态成功挂上时，而不是只停在常驻标签：
  - burn route 追加 `余烬`
  - bleed route 追加 `血痕`

## Success Criteria

- `RUN_EVENT_ROOM_POOL` 暴露 `烙痕圣坛` 与两条异常状态路线。
- 只有匹配状态的特攻会吃到对应 duration / damage 乘区。
- `特攻 O` 能直接读出当前 route identity 与武器不匹配提示。
- 强化异常状态真正挂上时出现独立 payoff cue。
