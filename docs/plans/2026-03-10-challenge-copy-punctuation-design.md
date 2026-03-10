# Challenge Copy Punctuation Design

## Background

`TODO.md` 的 Active 队列为空后，本轮继续沿着 challenge/sidebar dirty-copy lane 收口。当前 shared helper 已覆盖多类 decorator wrappers，以及 wrapper 内部的 colon、dash、pipe、slash、middle-dot separator，但 `、` / `，` / `;` / `；` 这组常见复制脏分隔符仍会让 decorator payload 识别失败，导致正文保留 wrapper 噪音。

## Goal

- 让 challenge decorator payload 在 wrapper 内部混入 leading/trailing comma separators 时继续正确剥离，并在正文耗尽时回退 `未知挑战`。
- 让同一路径兼容 leading/trailing semicolon separators，避免另一类常见标点重新打断 shared normalization。
- 把 README、操作指引与 regression checks 同步到同一组 punctuation guarantees，避免实现和文档再次漂移。

## Options

### Option A: 扩展 shared separator regex，复用现有 decorator/prefix cleanup 链（recommended）

- Pros: 一次改动覆盖 regular / compact / ultra-compact / badge / help overlay。
- Pros: 改动集中在 `shared/game-core.js`，CLI regression 易于锁定。
- Cons: 需要同步 README 和 `game.js` 里的长文档说明。

### Option B: 仅在 decorator token 判断里特殊处理 comma/semicolon

- Pros: 表面改动更小。
- Cons: label cleanup 与 payload cleanup 会分叉，后续 separator 扩展仍要重复补洞。

### Option C: 只补 regression/docs，保留当前实现

- Pros: 无运行时代码风险。
- Cons: 无法修复当前真实 failing cases，不满足本轮 TODO。

## Selected Design

- 采用 Option A。
- TODO 1：把 `、` / `，` 纳入 challenge wrapper payload 的 leading/trailing separator 规范化，让 `【、挑战】`、`《本局挑战，》` 等输入继续命中现有 decorator 剥离链。
- TODO 2：把 `;` / `；` 纳入同一组 separator 规范化，让 `【；挑战】`、`《本局挑战;》` 等输入复用同一路径。
- TODO 3：同步 README、操作指引和 regression checks，明确 comma / semicolon separators 也属于 dirty-copy cleanup 覆盖面。

## Testing

- 先在 `scripts/regression-checks.mjs` 为 comma separators 写 failing cases，运行回归确认 RED。
- 再补 shared regex 直到 GREEN。
- 然后对 semicolon separators 重复同一轮 RED/GREEN。
- 最后运行用户指定命令：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
