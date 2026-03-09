# Challenge No-Reward Guards Design

## Background

当前 challenge HUD 已经为 gold-only 与未来复合奖励路径补了 regular / compact / ultra-compact 的共享奖励短句守卫，但 `rewardGold = 0` 且没有显式 `rewardLabel` 的无奖励路径仍主要依赖现有 helper 的隐式行为。代码本身大体可工作，不过 regular 第三行与 compact 第二行的“无奖励时仍保留语义短句”还没有被锁成独立、可审计的 shared-helper 回归。

## Goal

- 让 regular 三行 challenge 摘要在无奖励路径下显式暴露共享 variants helper，并锁定进行中 / 完成态继续走 `进度:12/30 -> 12/30` / `进度:30/30 -> 30/30` 回退链。
- 让 compact 双行 challenge 摘要在无奖励路径下显式暴露共享 variants helper，并锁定进行中 / 完成态继续走 `击败 30 个敌人 -> 击败30个敌人` 回退链。
- README / 操作指引同步说明无奖励路径不会插入新的中间短句。

## Options

### Option A: 导出并复用显式 no-reward shared variants helper（recommended）

- Pros: 回归脚本可以直接命中 regular / compact 的共享短句生成层，而不是只从最终 sidebar lines 间接推断。
- Pros: 继续复用现有 line builder，不增加新的 HUD 分支。
- Cons: 需要补几项导出与少量命名整理。

### Option B: 只给 `buildRunChallengeSidebarLines` 补无奖励断言

- Pros: 改动更少。
- Cons: 测试只能覆盖最终组装结果，shared helper 的语义意图仍是隐式的。

### Option C: 只更新 README / TODO，不动 shared helper

- Pros: 零运行时风险。
- Cons: TODO 里的“共享文案回归守卫”仍没有真正落到共享 helper 层。

## Selected Design

- 使用 Option A。
- 在 `shared/game-core.js` 为 regular 路径拆出显式的进行中 / 完成态 detail variants helper；compact 路径继续保留现有共享 helper，但一并导出进行中 / 完成态 variants，便于回归脚本直接锁定无奖励短句。
- 先在 `scripts/regression-checks.mjs` 写 failing assertions，要求这些 helper 被导出，并验证无奖励 regular / compact 路径的 variants 与最终 sidebar lines。
- README / 游戏内帮助文案补一句：无奖励 challenge 路径不会插入额外奖励占位，仍沿用既有进度优先 / 标签优先回退链。

## Testing

- Failing tests:
  - regular 无奖励进行中 / 完成态 shared variants helper
  - compact 无奖励进行中 / 完成态 shared variants helper
  - regular / compact 无奖励 sidebar lines 在窄宽度预算下的最终语义回退
- Final verification:
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
