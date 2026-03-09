# Challenge Reward Tier Consistency Design

## Background

`shared/game-core.js` 已经为 ultra-compact 可见摘要和标题徽记抽出了 `formatRunChallengeRewardShortLabel`，并允许未来奖励通过 `rewardLabel` 传入 `+9999金 +净化` 这类复合短句。

当前剩余风险不在 ultra-compact，而在 regular / compact：

- regular 三行摘要的奖励行仍写死为 `奖励:+N 金币`；
- compact 完成态第二行仍写死为 `标签 · +N金`；
- 这会让未来复合奖励在不同分档里出现不同文案来源，形成跨分档漂移。

## Goal

- 让 regular / compact 中所有“实际显示奖励短句”的路径都复用同一 helper。
- 保持当前信息层级不变，不额外在 compact 进行中态暴露奖励。
- 用回归测试锁定 explicit `rewardLabel` 在 regular / compact 的展示结果，并同步 README / H 帮助文案。

## Options

### Option A: 维持现状

- Pros: 零实现成本。
- Cons: 未来一旦奖励从纯金币扩成复合短句，regular / compact 会和 ultra-compact 脱节。

### Option B: 仅修 compact

- Pros: 改动较小。
- Cons: regular 仍保留旧金币模板，问题只解决一半。

### Option C: 所有“显示奖励”的分档统一走共享 helper（recommended）

- Pros: 最小改动就能消除跨分档漂移。
- Pros: 不改变 compact 进行中态的信息密度。
- Cons: 需要补 regular / compact 的回归守卫和文档说明。

## Selected Design

- 采用 Option C。
- regular 三行摘要的第三行改为 `进度:...  奖励:<reward short label>`，无奖励时保留空短句回退。
- compact 完成态第二行改为 `挑战标签 · <reward short label>`，不再直接拼接金币模板。
- compact 进行中态继续维持两行 `本局挑战 进度 / 标签`，不新增奖励短句。
- README 与 `game.js` 的帮助文案补一句：regular / compact 中凡是显示奖励短句的路径，也和 ultra-compact 共用同一 helper。

## Testing

- 先在 `scripts/regression-checks.mjs` 增加 failing cases：
  - regular 三行摘要在 explicit `rewardLabel` 下显示复合短句；
  - compact 完成态在 explicit `rewardLabel` 下显示复合短句。
- 再在 `shared/game-core.js` 接入最小实现。
- 最后同步 `README.md`、`game.js`、`TODO.md`、`PROGRESS.log`，并运行规定验证命令。
