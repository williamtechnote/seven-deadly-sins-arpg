# Compact Challenge Semantic Fallback Design

## Background

`compact` 档位的本局挑战摘要现在固定为两行：

- 第一行：`本局挑战 12/30`
- 第二行：`击败 30 个敌人 · +90金`

第二行虽然已经复用了共享奖励短句 helper，但在更窄的宽度预算下仍然直接交给通用省略逻辑处理，还没有像 `ultraCompact` 单行摘要那样先走语义化回退。因此一旦奖励短句或未来复合奖励继续拉长，`compact` 第二行会更早退化成泛化截断，而不是先保留“挑战目标”这条更核心的扫读信息。

## Goal

- 为 `compact` 进行中本局挑战第二行增加 width-aware 语义回退。
- 继续复用共享奖励短句 helper，不新造一套 reward copy。
- 保持最小改动，只覆盖当前 TODO 指向的进行中场景，把完成态评估留作后续 heartbeat。

## Options

### Option A: 继续依赖通用省略

- Pros: 无需实现。
- Cons: 更窄预算下会直接变成通用截断，丢失“先稳住挑战语义”的设计目标。

### Option B: 第二行走 `挑战名 · 奖励 -> 挑战名` 的语义回退（recommended）

- Pros: 最小改动，直接复用现有 `pickChallengeLabelVariant()` 宽度判定。
- Pros: 兼容 gold-only 与未来 compound reward 短句。
- Cons: 极端更窄时仍会回到通用截断，但那已经是标签本身放不下的下一层问题。

### Option C: 第二行走 `挑战名 · 奖励 -> 奖励`

- Pros: 奖励在窄宽度下更容易保留。
- Cons: 第一行已经有进度，若第二行只剩奖励，会弱化“当前在做什么挑战”的扫读价值。

## Selected Design

- 采用 Option B。
- 进行中 `compact` 第二行在宽度足够时继续显示 `挑战名 · 奖励`。
- 当第二行预算收紧时，先回退到纯挑战名，不额外插入 reward-only 中间短句。
- gold-only / future compound reward 都走同一条链路。
- 完成态是否也要补同类 `挑战名 · 奖励 -> 挑战名` 回退，保留为下一轮 follow-up。

## Testing

- 先为 `compact` 进行中 second-line fallback 补两条回归：
  - gold-only 奖励在窄预算下回退到纯挑战名；
  - future compound reward 在同类预算下也复用同一回退链。
- 先跑 `node scripts/regression-checks.mjs` 看新断言失败，再实现 helper。
- 完成后运行固定 heartbeat 验证命令。
