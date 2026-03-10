# Challenge CJK Quote Decorators Design

## Background

`TODO.md` 的 Active 队列为空后，本轮继续沿着 run challenge label cleanup 这条 shared helper lane 收口。当前 `shared/game-core.js` 已覆盖常见 bracketed / quoted / nested decorators，以及多类 separator dirty-copy token，但仍有三组相邻的 CJK quote wrapper 尚未进入 decorator 剥离链：

- half-width corner quotes：`｢挑战｣` / `｢本局挑战｣`
- presentation-form quotes：`﹁挑战﹂` / `﹃本局挑战﹄`
- ornamental double-prime quotes：`〝挑战〞` / `〝本局挑战〞`

这些输入目前会把 wrapper 原样漏进 regular / compact / ultra-compact challenge copy，和既有 plain-text 前缀去重、`未知挑战` 回退链脱节。

## Goal

- 让 `｢｣` 进入现有 decorator 剥离链。
- 让 `﹁﹂` / `﹃﹄` 进入同一条 decorator 剥离链。
- 把 `〝〞` 保留为下一轮紧邻 follow-up，避免本轮继续扩 scope。

## Options

### Option A: 扩展现有 decorator pair 列表（recommended）

- Pros: 改动集中在 `shared/game-core.js`，所有 challenge/sidebar surface 自动复用。
- Pros: 现有 regression surface 已集中在 `scripts/regression-checks.mjs`，最适合 TDD。
- Cons: README / 操作指引需要同步补上新的 quote family 示例。

### Option B: 单独新增 CJK quote 预处理 helper

- Pros: 语义更显式。
- Cons: 会把已统一的 normalization pipeline 再拆出一个分支，后续维护更容易漂移。

### Option C: 只在 UI 文案层打补丁

- Pros: 表面改动更小。
- Cons: 无法修复 shared helper 与 CLI regression surface，也无法保证未来 surface 一致。

## Selected Design

- 采用 Option A。
- 先在 `scripts/regression-checks.mjs` 添加 `｢｣` 与 `﹁﹂` / `﹃﹄` 的 failing assertions，并同步 README / help overlay 的文案断言。
- 再扩展 `RUN_CHALLENGE_DECORATOR_PAIRS`，只纳入本轮前两项 TODO 对应的 wrapper。
- `README.md` 与 `game.js` 的 challenge-cleanup 说明补充这两组 CJK quote wrapper。
- `〝〞` 保持在 `TODO.md` Active，作为下一轮 follow-up。

## Testing

- Failing regression:
  - `getRunChallengeSafeSidebarLabel('｢挑战｣击败 30 个敌人') === '击败 30 个敌人'`
  - `getRunChallengeSafeSidebarLabel('｢本局挑战｣挑战：本局') === '未知挑战'`
  - `getRunChallengeSafeSidebarLabel('﹁挑战﹂击败 30 个敌人') === '击败 30 个敌人'`
  - `getRunChallengeSafeSidebarLabel('﹃本局挑战﹄挑战：本局') === '未知挑战'`
- Doc regression:
  - `README.md` 与 `game.js` 操作指引都明确列出 `｢｣` 与 `﹁﹂` / `﹃﹄` 会先剥离再继续做 `本局` / `挑战` 去重。
- Final verification:
  - `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
