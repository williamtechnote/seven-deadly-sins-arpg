# Challenge Unknown No-Reward Design

## Background

`TODO.md` 当前没有 Active 项，但 challenge 文案这条 heartbeat 链路还缺两块显式守卫：当上游标签在 prefix 去重后回退成 `未知挑战`，且当前 challenge 又没有奖励短句时，regular / compact 摘要虽然运行时已经大概率沿用既有语义回退，但还没有独立的共享 helper 暴露与直接回归覆盖。

## Goal

- 把剩余工作拆成 3 个 heartbeat 子项，并只实现前 2 项。
- 为 regular 三行摘要锁定 `未知挑战` + no-reward 路径，避免未来 helper 漂移后插入伪奖励占位。
- 为 compact 双行摘要锁定同一类路径，确认第二行继续优先保留 `未知挑战` 主体。
- 保留 ultra-compact 隐藏 badge 的同类评估为 follow-up，本轮不扩 scope。

## Options

### Option A: 导出并复用现有 safe-label helper，再补 regular / compact 的直接回归（recommended）

- Pros: 改动最小，继续把标签清洗逻辑集中在 shared helper。
- Pros: regular / compact 都能用同一个 helper 证明 `未知挑战` 回退稳定。
- Cons: 行为改动很小，本轮更多是在把既有策略显式化并防回归。

### Option B: 为 regular / compact 各自再写一层 `未知挑战` no-reward 专用逻辑

- Pros: 测试目标更直观。
- Cons: 重复规则，容易让两个分档继续漂移。

### Option C: 只补 README / regression，不动 shared helper

- Pros: 最省改动。
- Cons: 缺少一个可直接断言的 shared API，未来回归定位会继续偏 UI 结果导向。

## Selected Design

- 使用 Option A。
- 导出 challenge safe-label helper，让 tests 可以直接覆盖“重复前缀 -> `未知挑战`”的 shared 规则。
- 在 `scripts/regression-checks.mjs` 先写 failing tests，覆盖：
  - safe-label helper 的 direct export
  - regular in-progress / completed 在 `未知挑战` + no-reward 下继续保留正文 `未知挑战` 与 progress-only 第三行
  - compact in-progress / completed 在 `未知挑战` + no-reward 下继续保留 `未知挑战`
- README / help overlay 同步补一句：`未知挑战` + no-reward 路径仍沿用既有回退链，不新增占位奖励。

## Testing

- Red: `node scripts/regression-checks.mjs`
- Green: `node scripts/regression-checks.mjs`
- Final heartbeat verification:
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
