# Challenge Copy Normalization Design

## Background

当前 challenge HUD 文案已经覆盖了前缀去重、奖励短句共享和多档位回退链，但仍默认上游传入的正文与 `rewardLabel` 已经是“干净文案”。如果标签正文夹带重复半角/全角空白，regular / compact 摘要会原样保留异常大空隙；如果未来显式 `rewardLabel` 夹带多余空白，regular / compact / ultra-compact / 完成浮字 / badge 也会一起变宽，提前触发不必要的文案降级。

## Goal

- 让 challenge 标签在去除 `本局/挑战` 前缀后，再统一压缩正文里的重复半角/全角空白。
- 让显式 `rewardLabel` 在共享 helper 中统一压缩多余空白，保持所有 HUD 路径宽度与文案一致。
- 不引入新的 UI 分支，只在共享 helper 层做规范化。

## Options

### Option A: 在 shared helper 内统一做 challenge label / rewardLabel 空白规范化（recommended）

- Pros: regular / compact / ultra-compact / badge / 完成浮字都会自动对齐。
- Pros: 改动集中，回归测试可直接锁在 shared helpers 上。
- Cons: 需要同步 README / 帮助文案说明“输入脏文案会被规范化”。

### Option B: 在各个 HUD surface 分别做字符串清洗

- Pros: 单点行为更直观。
- Cons: 容易遗漏 badge、完成浮字或未来新 surface，文案规则会再次漂移。

### Option C: 只补 README，不改 helper

- Pros: 零运行时代码风险。
- Cons: 不能真正修复脏文案导致的异常宽度和阅读噪音。

## Selected Design

- 使用 Option A。
- `normalizeRunChallengeSidebarLabel` 在前缀去重后继续压缩连续空白，并兼容全角空白。
- `formatRunChallengeRewardShortLabel` 对显式 `rewardLabel` 也做同样的空白规范化，再决定是否回退到 `rewardGold`。
- 先在 `scripts/regression-checks.mjs` 写 failing tests，覆盖 challenge 标签正文与显式奖励短句的空白规范化。
- README / 游戏内帮助文案补充一句：共享 challenge / reward helper 会压缩异常空白，保证各分档沿用同一文案预算。

## Testing

- failing tests: `buildRunChallengeSidebarLines` 在 regular / compact 下压缩 challenge 标签异常空白；`formatRunChallengeRewardShortLabel` / `buildRunChallengeCompletedFeedbackText` / ultra-compact summary 与 badge 复用规范化后的显式 `rewardLabel`。
- final verification:
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
