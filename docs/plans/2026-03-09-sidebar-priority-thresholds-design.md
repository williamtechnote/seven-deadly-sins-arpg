# Sidebar Priority Thresholds Design

## Background

`TODO.md` 里关于右侧固定侧栏只剩一条宽泛的“继续评估阈值 / 优先级策略”任务。当前侧栏已经具备 Phaser 实测宽度钳制、动态纵向堆叠，以及对词缀 / 事件房摘要的窄视口行数上限；但仍有两个明显缺口：

- 本局挑战摘要始终占 3 行，默认 `1024x768` 视口下会稳定吃掉一段固定高度；
- 侧栏没有真正的溢出优先级策略，未来继续加区块时只能一味向下堆叠。

## Goal

- 把剩余 Active TODO 拆成 3 个明确 heartbeat 子项。
- 先用最小安全策略解决两个已知缺口：挑战摘要紧凑化，以及侧栏溢出时的低优先级降级。
- 保留更细的分档阈值 / 优先级调优为后续 follow-up，不在本轮做折叠交互或大改 HUD。

## Options

### Option A: 针对当前缺口补最小策略（recommended）

- Pros: 改动范围小，能直接落在现有 `UIScene` + shared helper 架构上。
- Pros: 可用纯逻辑 helper + source-hook 回归覆盖，风险低。
- Cons: 仍然只处理当前最明显的两个阈值 / 优先级缺口，没有一次性做完所有未来扩展策略。

### Option B: 直接做完整侧栏规则引擎

- Pros: 一次性把所有区块都纳入统一权重 / 压缩 / 折叠系统。
- Cons: 明显超出当前 heartbeat 所需范围，且没有足够真实新增区块来校准规则。

### Option C: 继续只靠现有动态堆叠

- Pros: 无需新增逻辑。
- Cons: Active TODO 继续宽泛悬空，未来新增区块时仍会回到相同问题。

## Selected Design

- 使用 Option A。
- 子项 1：为本局挑战摘要增加 compact 模式，在窄视口下压缩为 2 行，保留“状态 / 进度”和挑战目标，把奖励信息从紧凑态里让位出去。
- 子项 2：为右侧固定侧栏增加可复用的溢出优先级 helper；当总高度超过安全底线时，先隐藏 `事件房摘要`，若仍超出，再隐藏 `本局词缀正文`，但保留区域名、章节标题与挑战摘要。
- 子项 3：保留 follow-up，只继续评估未来新增区块是否需要更多视口分档（例如更矮但不窄的窗口）与更细的优先级组合。

## Testing

- 在 `shared/game-core.js` 为挑战摘要紧凑行生成 helper 与优先级堆叠 helper 加纯逻辑回归。
- 在 `scripts/regression-checks.mjs` 增加 source-hook 断言，确保 `UIScene` 真正走 compact challenge 路径和优先级溢出路径。
- README / 帮助文案同步 compact challenge 与溢出优先级说明。
- 最终运行：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
