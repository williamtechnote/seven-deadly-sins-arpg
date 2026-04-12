# Control-Route Live Target Recommendation Design

## Context

`连斩 / 游步 / 借势 / 催锋 / 回身 / 追猎` 已经会把当前冷却与体力 bottleneck 压成高置信 recommendation，并把被选中的 reason 继续升级成第三房 route-specific echo。`镇步 / 破势` 虽然已经有 HUD payoff、route mapping 与 baseline anchor，但 choice panel 仍只会停在“当前武器能否触发”的静态判断，读不出最近交手里到底更该先补控制，还是已经可以直接追 payoff。

当前 repo 的设计方法强调：事件房应回答“这条路线现在解决什么问题”。对 slow/control 路线来说，这个问题不只是“你有没有减速武器”，还包括“你最近是否已经打出减速目标”以及“Boss 破招窗口是否刚好让 `破势` 变成立刻可兑现的路线”。

## Options

1. 继续沿用静态 loadout 判断。
Rejected: 只能告诉玩家“能不能触发”，无法回答“当前更该先挂减速还是直接打兑现”。

2. 只用血线 / 冷却 heuristics 粗略扩 `镇步 / 破势`。
Rejected: 仍然缺少 control-route 最关键的 target context，容易把 `破势` 推荐成空转。

3. 记录短时 recent-control context，并把它接进 recommendation + routed echo。
Recommended: 不需要新增 UI 面，也不要求实时锁定敌人；只要把最近刚出现的 `减速目标 / 破招窗口` 压成短时可读状态，就能让 shrine recommendation 真正回答“现在该先控还是该兑现”。

## Chosen Direction

为 `镇压圣坛` 增加一组短时 recent-control recommendation context：

- `controlTargetSlowMs`：最近交手里已出现可直接吃 `破势` 的减速目标
- `controlFinisherWindowMs`：最近交手里已出现 slow + break 的 `破势终结` 窗口

在 shared recommendation helper 中新增三条 control-route reason：

- `镇步修习` -> `先挂减速`
- `破势修习` -> `减速目标已现`
- `破势修习` -> `可接破势终结`

并把这三条 reason 继续接进第三房 routed encounter echo：

- `先挂减速` -> `减速稳场`
- `减速目标已现` -> `减速追赏`
- `可接破势终结` -> `终结追赏`

## Design Notes

- recent-control context 只保留短时记忆，不持久化到存档，也不引入新的面板元素
- `game.js` 负责在 recent slowed-hit / finisher moment 上更新短时窗口，再把剩余毫秒传给 choice panel preview state
- `shared/game-core.js` 继续作为 recommendation reason 与 routed encounter echo 的唯一判断源
- 现有 baseline anchor `镇步控场 / 破势追杀` 继续保留；只有真的命中高置信 recent-control context 时才升级成更窄的 echo

## Success Criteria

- choice panel 会在高置信 control context 下给出 `先挂减速 / 减速目标已现 / 可接破势终结`
- 选中这些 recommendation 后，resolved receipt 会持久化同一条 reason
- 第三房 entry / clear / source cue 会把这三条 reason 升级成 `减速稳场 / 减速追赏 / 终结追赏`
- README / help overlay / regression checks 一起锁到同一条 contract
