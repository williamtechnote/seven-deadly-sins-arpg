# Encounter Bounty Payoff Receipt Design

## Context

`缓冲战 / 高压战 / 淘金战` 已经会把第三房的敌群构成、起手节奏与赏金载体分开：`淘金战` 会把更重赏金压到后排延后目标并挂 `赏金` 标记。但当玩家真的追到这个目标时，反馈仍主要退回普通金币掉落与拾取，路线决策只在“追谁”这一步清楚，在“追到之后发生了什么”这一步仍偏弱。

方法论文档已经把方向讲得很清楚：奖励应当在接下来的 30 秒内可感知，而且最好直接落在玩家刚做出的战斗决策上。这里缺的不是更多数值，而是一次更明确的 kill-time payoff。

## Options

1. 给事件房或 HUD 再补更多预告文案。
Rejected: 这只会把“会更赚钱”说得更清楚，但不会让击杀瞬间更有确认感。

2. 让所有 routed 金币掉落都变得更吵。
Rejected: `高压战 / 缓冲战` 需要继续保持更平均、更平稳的收益读感；如果每个掉金点都变成强反馈，反而会冲淡 `淘金战` 的追赏金身份。

3. 只给高赏金目标补 kill-time 回执与更亮的掉金爆点。
Recommended: 这条路径直接兑现已有 `赏金` 标记，不新增新系统，也能通过 shared helper + runtime source hook 锁成 deterministic contract。

## Chosen Direction

为 encounter slot 的 reward metadata 再补一层 shared payoff feedback contract：

- 普通房 / 平均掉金目标继续沿用稳定的金币拾取反馈。
- `淘金战` 的高赏金目标死亡时，立即补一条 `赏金+X` 这类短回执，并在尸体位置触发更亮的金币爆点。
- 实际掉落的金币拾取物也沿用这组 metadata 做更亮的 tint / scale，但不改变金币总量或拾取规则。

## Design Notes

- `shared/game-core.js` 负责根据 formation slot 的 reward metadata 与本次实际掉金数量，生成统一的 payoff presentation contract，例如 `receiptLabel`、`receiptColor`、`pickupTint`、`pickupScale`。
- `Enemy.takeDamage()` 在确定实际 gold drop 后，调用 shared helper，把 payoff presentation 一起附在 `drops` payload 上。
- `game.js` 只消费这组 contract：在 `_spawnDropPickups()` 里触发 receipt 浮字 / pulse，并把 pickup 的 tint / scale 应到金币拾取物上。
- 这项改动不继续抬高 `enemyGoldMultiplier`，也不引入额外随机性；它只把已有 reward routing 转成更清晰的瞬时确认。

## Success Criteria

- `淘金战` 的高赏金目标死亡时，会立刻给出明显区别于普通掉金的短回执。
- `高压战 / 缓冲战` 仍保持更平均、更平稳的掉金反馈，不会被统一放大成满屏奖励提示。
- shared helper 与 runtime hook 都有回归覆盖，README 只补一条简洁 contract 说明。
