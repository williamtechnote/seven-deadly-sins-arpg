# Sidebar Stack Heading Design

## Background

`TODO.md` 目前只剩一条宽泛的“继续评估右侧固定侧栏后续新增长文案”任务。现有侧栏已经把区域名、本局词缀、本局挑战与事件房摘要接上 Phaser 实际测量，但还剩两类结构性风险：

- `runModifierTitle` 仍是直接写死的标题文本，没有走同一套单行实测钳制路径；
- 右侧固定侧栏的几个区块仍靠固定 `Y` 偏移排版，未来任何新增或变长文案都可能在纵向上互相顶住；
- 更窄视口下是否还要增加折叠/行数上限策略，仍值得保留为后续评估项。

## Goal

- 让固定侧栏章节标题也走可复用的 Phaser 实测单行钳制，避免未来标题文案增长时重新手补特殊分支。
- 让固定侧栏现有区块按实际渲染高度顺序堆叠，而不是继续依赖固定间距，降低未来加长文案时的纵向碰撞风险。
- 保留一个更窄视口/更多区块时的后续评估项，不把本轮 heartbeat 扩成整套 HUD 重构。

## Options

### Option A: 继续只处理具体字符串

- Pros: 改动最小。
- Cons: 每次新增侧栏文案都要再补一条专门规则，无法处理纵向碰撞。

### Option B: 补齐标题测量，并把侧栏区块改为按实际高度堆叠（recommended）

- Pros: 延续现有“Phaser 实测优先 + 纯逻辑 helper 可回归”的模式。
- Pros: 同时解决未来长标题和多行摘要增长后的纵向重叠问题。
- Cons: 需要补一个共享排版 helper 和对应回归测试。

### Option C: 直接重做整个右侧 HUD

- Pros: 理论上最自由。
- Cons: 超出当前 TODO 范围，也会把一次心跳任务扩成版式重构。

## Selected Design

- 采用 Option B。
- 子项 1：为固定侧栏章节标题接入单行 Phaser 实测钳制，先覆盖 `runModifierTitle`，并抽成可复用 helper。
- 子项 2：为固定侧栏区块增加基于实际渲染高度的纵向堆叠 helper，让区域名、词缀、挑战、事件房按当前内容高度顺序排布。
- 子项 3：保留“是否要为窄视口/未来新增区块追加折叠或行数上限策略”为后续 Active TODO。

## Testing

- 先在 `scripts/regression-checks.mjs` 增加标题测量接线和侧栏纵向堆叠 helper 的 failing coverage。
- 再在 `shared/game-core.js` / `game.js` 接上最小实现。
- 最后同步 `README.md` / `TODO.md` / `PROGRESS.log`，并运行规定命令：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
