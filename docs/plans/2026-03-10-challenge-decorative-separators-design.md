# Challenge Decorative Separators Design

## Background

`TODO.md` 当前没有 Active 队列，因此本轮沿着 run-challenge decorator payload 清洗继续收口。现有 `shared/game-core.js` 已兼容 colon / dash / pipe / slash / comma / semicolon / sentence punctuation 等 wrapper 内部 separator，但波浪号、ellipsis 与 backslash 这组三方输入里常见的 decorative separators 仍会让 decorator payload token 判断失败，导致正文保留 `【~挑战】` / `【…挑战】` / `【\\挑战】` 这类 wrapper 噪音。

## Goal

- 让 wrapper 内部的 leading/trailing tilde separators（`~` / `～`）继续命中现有 decorator 剥离链。
- 让 wrapper 内部的 leading/trailing ellipsis separators（`…` / `⋯`）复用同一条 token 规范化路径。
- 把 backslash separator cleanup 记录为紧邻的第三个 TODO，本轮只实现前两个。

## Options

### Option A: 扩展 shared separator regex，继续复用既有 decorator/prefix cleanup 链（recommended）

- Pros: regular / compact / ultra-compact / badge / 完成浮字会自动复用同一规则。
- Pros: 改动集中在 `shared/game-core.js` 与 `scripts/regression-checks.mjs`，适合 TDD。
- Cons: README 与 `game.js` 的帮助文案需要同步补充新的 dirty-copy 示例。

### Option B: 只在 `isRunChallengePrefixToken()` 里特判新增符号

- Pros: 表面改动更小。
- Cons: separator 规则继续分叉，后续再补 backslash 时仍要重复扩洞。

## Selected Design

- 采用 Option A。
- TODO 1：把 `~` / `～` 纳入 challenge wrapper payload 的 leading/trailing separator 规范化。
- TODO 2：把 `…` / `⋯` 纳入同一组 separator 规范化。
- TODO 3：保留 backslash separator 作为下一轮 Active TODO。

## Testing

- 先在 `scripts/regression-checks.mjs` 为 tilde separators 写 failing assertions，确认 RED。
- 再扩展 shared regex 到 GREEN。
- 然后对 ellipsis separators 重复同一轮 RED/GREEN。
- 最后运行用户指定验证命令：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
