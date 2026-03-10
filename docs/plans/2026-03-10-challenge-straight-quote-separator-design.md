# Challenge Straight-Quote And Separator Design

## Background

`TODO.md` 的 Active 为空后，本轮继续沿用 challenge/sidebar normalization 这条窄车道。当前 shared helper 已覆盖多数组 decorator wrapper、wrapper 内部脏 separator 与 reward short-label 规范化，但仍有两类真实脏输入会漏过：

- wrapper payload 如果只有 standalone separator（如 `【：】` / `《-》`），当前不会被识别为 challenge token。
- ASCII straight quotes（`"` / `'`）尚未纳入 decorator pair，因此 `"挑战"` / `'本局挑战'` 会原样泄漏进正文。

第三个可顺手保留的 follow-up 是 nested mixed straight-quote wrapper，例如 `【"挑战"】`。

## Goal

- 让 separator-only wrapper payload 继续走同一条 decorator 剥离、plain-text 前缀去重和 `未知挑战` 回退链。
- 让 ASCII straight-quote decorator 前缀与现有 smart-quote / bracket wrapper 一样由 shared helper 统一处理。
- 把 nested ASCII straight-quote mixed wrapper 留在 Active 里，作为本轮后续 heartbeat 的紧邻任务。

## Options

### Option A: 扩 shared challenge token / decorator logic（recommended）

- Pros: regular / compact / ultra-compact / hidden badge / 完成浮字自动共享行为。
- Pros: 改动集中在 `shared/game-core.js`，回归脚本容易先写失败样例再补实现。
- Cons: README / help overlay 要补两条新的 dirty-input 说明。

### Option B: 在各摘要 surface 前单独补丁字符串

- Pros: 看起来改动范围小。
- Cons: 规则会分叉，后续 separator / decorator lane 会继续失真，和当前 shared-helper 方向相反。

## Selected Design

- 采用 Option A。
- TODO 1：让 `isRunChallengePrefixToken` 接受经 separator 清洗后变空的 standalone separator token，这样 `【：】` / `《-》` 会像 `【：挑战】` 一样被剥离。
- TODO 2：把 ASCII `'` / `"` 纳入 challenge decorator pairs，使 `"挑战"` / `'本局挑战'` 进入既有前缀去重与 `未知挑战` 回退链。
- TODO 3：保留 nested ASCII straight-quote mixed wrapper 为下一轮 Active，例如 `【"挑战"】` / `《'本局挑战'》`。

## Testing

- 先在 `scripts/regression-checks.mjs` 为前两条 TODO 增加 failing cases。
- 用指定命令确认新增断言先失败，再改 `shared/game-core.js`。
- 完成后同步 `README.md` 与 `game.js` help overlay 文案，并重跑同一条验证命令。
