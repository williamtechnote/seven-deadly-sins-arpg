# Sidebar Narrow-Viewport Line Caps Design

## Background

`TODO.md` 目前只剩一条宽泛的“评估窄视口 / 未来新增区块侧栏策略”任务。右侧固定侧栏已经接入 Phaser 实际测量与按高度堆叠，但默认画布就是 `1024x768`，此时若本局词缀、挑战摘要、事件房摘要继续叠长，很容易把后续区块继续往下挤。当前 cycle 已明确预批准采用 Option A：窄视口下使用“行数上限 + 末行省略”，本轮不做折叠面板。

## Goal

- 把剩余 Active TODO 拆成三个可执行的 heartbeat 子项。
- 为右侧固定侧栏补一个可复用的“多行上限 + 末行省略” helper，先落在当前最容易增长的区块上。
- 保留一个更小视口 / 未来新增区块的阈值与优先级调优 follow-up，不在本轮引入折叠交互。

## Options

### Option A: 窄视口下为长区块增加行数上限，并在最后一行用省略号收尾（approved）

- Pros: 改动最小，能直接限制纵向增长。
- Pros: 可以延续现有 shared helper + Phaser 实测回调模式，CLI 回归可覆盖。
- Cons: 需要定义哪些区块先启用，以及窄视口阈值。

### Option B: 为右侧侧栏做可折叠区块

- Pros: 压缩空间更激进。
- Cons: 本轮已明确不做；会额外引入交互状态与可用性问题。

### Option C: 继续只靠动态堆叠，不限制行数

- Pros: 无需改动 copy。
- Cons: 无法真正限制总高度，剩余 TODO 仍然没有落地策略。

## Selected Design

- 采用 Option A。
- 子项 1：在 shared 层新增可复用的多行上限 helper，支持“先按宽度钳制每一行，再把可见行数限制到给定上限，若溢出则在最后一行追加省略号”。
- 子项 2：`UIScene` 在窄视口下为当前最易增长的固定侧栏区块启用该 helper，先覆盖 `本局词缀` 与 `事件房摘要`，把超出的行压成带省略号的最后一行。
- 子项 3：保留 follow-up，只继续评估未来新增区块的阈值、优先级与是否需要更细的分配策略；本轮不做折叠。

## Testing

- 先在 `scripts/regression-checks.mjs` 为 shared helper 增加纯逻辑失败用例，再加 source-hook 断言确保 `UIScene` 的窄视口路径真正调用 line-cap helper。
- 再在 `shared/game-core.js` / `game.js` 做最小实现。
- README、帮助文案、TODO、PROGRESS 在同一轮同步，并运行既定验证命令：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
