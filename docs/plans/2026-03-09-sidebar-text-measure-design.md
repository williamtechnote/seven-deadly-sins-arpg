# Sidebar Text Measure Extension Design

## Background

`TODO.md` 只剩一个宽泛的评估项，指向右侧固定侧栏里还没接上 Phaser 实际测量的长文案路径。当前最明显的两个缺口是：

- `UIScene.challengeText` 直接输出 `本局挑战 / 挑战名 / 进度+奖励` 三行文案，没有运行时宽度钳制；
- `UIScene.eventRoomText` 虽然有固定 `wordWrap`，但长路线摘要和 `已选路线 · 结算` 合并行仍然依赖静态换行宽度，不会按真实渲染宽度收窄。

## Goal

- 让右侧固定侧栏里的挑战摘要在超长挑战名、奖励说明下仍保持在 HUD 宽度内。
- 让右侧固定侧栏里的事件房摘要在长路线标签、长结算说明下复用真实测量与省略钳制，而不是继续只靠 `wordWrap`。
- 复用现有 `clampTextToWidth` 的方向，保持“Phaser 实测优先，纯逻辑 helper 可回归”的模式。

## Options

### Option A: 继续调小固定 `wordWrap` / 字号

- Pros: 改动最少。
- Cons: 仍然依赖静态宽度，半角/全角混排和不同文案密度下不稳定，也无法统一挑战与事件房的处理。

### Option B: 为右侧固定侧栏补一套 Phaser 测量 + 逐行钳制 helper（recommended）

- 在 `shared/game-core.js` 补纯逻辑的多行文本宽度钳制 helper。
- 在 `UIScene` 增加隐藏测量节点和缓存，按样式逐行测量挑战/事件房文案。
- 保留右对齐布局，只收紧实际文本内容。

### Option C: 重做整个右侧侧栏版式

- Pros: 空间更大。
- Cons: 超出本轮 heartbeat 范围，也不符合 TODO 当前只要求延伸测量流程的目标。

## Selected Design

- 采用 Option B。
- 子项 1：为 `challengeText` 接入 Phaser-backed 逐行测量与宽度钳制。
- 子项 2：为 `eventRoomText` 接入 Phaser-backed 逐行测量与宽度钳制，替代仅靠 `wordWrap` 的路径。
- 保留“是否继续扩展到本局词缀 / 区域名”等剩余固定侧栏长文案”为本轮后续评估项。

## Testing

- 在 `shared/game-core.js` 为多行文本钳制 helper 增加纯逻辑回归测试。
- 在 `scripts/regression-checks.mjs` 增加 source-hook 检查，确认 `UIScene` 对挑战摘要和事件房摘要都走 Phaser 测量 helper。
- 最后执行规定的 `node --check ... && node scripts/regression-checks.mjs` 作为交付验证。
