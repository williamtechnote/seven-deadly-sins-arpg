# Challenge Sentence Punctuation Design

## Background

`TODO.md` 的 Active 队列为空后，本轮继续沿着 run-challenge decorator payload 清洗这条 shared helper 收口。当前 `shared/game-core.js` 已兼容 colon / dash / pipe / slash / comma / semicolon / middle-dot 这组 wrapper 内部 separator，但 `。` 以及 `!` / `?` / `！` / `？` 这类句末脏标点仍会让 decorator payload token 判断失败，导致正文保留 `【。挑战】` / `【!挑战】` 之类 wrapper 噪音。

## Goal

- 让 wrapper 内部的 leading/trailing period punctuation（如 `。`）继续命中现有 decorator 剥离链。
- 让 wrapper 内部的 leading/trailing exclamation/question punctuation（如 `!` / `?` / `！` / `？`）复用同一条 token 规范化路径。
- 同步 README、操作指引与回归断言，避免实现和文档再次漂移。

## Options

### Option A: 扩展 shared separator regex，继续复用既有 decorator/prefix cleanup 链（recommended）

- Pros: regular / compact / ultra-compact / badge / help overlay 全部自动复用。
- Pros: 改动集中在 `shared/game-core.js`，最容易用现有 CLI regression surface 锁定。
- Cons: 需要同步 README 和 `game.js` 的长文档说明。

### Option B: 只在 `isRunChallengePrefixToken()` 里特判 sentence punctuation

- Pros: 看起来只动一个函数。
- Cons: separator 规则会分叉；下一类标点仍要重复补洞。

### Option C: 只补 docs/tests，不动 shared helper

- Pros: 运行时代码零风险。
- Cons: 无法修复当前真实漏网输入，不满足本轮 TODO。

## Selected Design

- 采用 Option A。
- TODO 1：把 `。` 纳入 challenge wrapper payload 的 leading/trailing separator 规范化，让 `【。挑战】` / `《本局挑战。》` 继续走现有 decorator 剥离与 `未知挑战` 回退链。
- TODO 2：把 `!` / `?` / `！` / `？` 纳入同一组 separator 规范化，让 `【!挑战】` / `《本局挑战？》` 等输入复用同一路径。
- TODO 3：同步 README、操作指引与回归检查，明确 sentence punctuation separators 也属于 dirty-copy cleanup 覆盖面。

## Testing

- 先在 `scripts/regression-checks.mjs` 为 period separators 写 failing assertions，确认 RED。
- 再扩展 shared regex 到 GREEN。
- 然后对 exclamation/question separators 重复同一轮 RED/GREEN。
- 最后运行用户指定验证命令：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
