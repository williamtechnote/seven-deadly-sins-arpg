# Challenge Extra Decorators Design

## Background

`TODO.md` 的 Active 队列已经清空，但 challenge/sidebar 标签清洗这一条 shared helper 仍有相邻缺口。当前正则已覆盖 square/angle/quote/parenthesis decorator，不过 `{挑战}` / `｛本局挑战｝` 与 `《挑战》` / `〈本局挑战〉` 这类上游包装仍会漏进正文；`〔挑战〕` / `〖本局挑战〗` 也还是下一组未覆盖的 decorator 变体。

## Goal

- 让 curly-brace decorator 前缀进入现有 decorator 剥离链。
- 让 book-title decorator 前缀进入同一条剥离链，并继续复用 plain-text 前缀去重、leading separator 清洗与 `未知挑战` 回退。
- 把 shell/lenticular decorator 记录为下一轮紧邻 TODO，避免本轮范围继续膨胀。

## Options

### Option A: 扩展现有 decorator regex（recommended）

- Pros: 改动集中在 `shared/game-core.js`，regular / compact / ultra-compact / badge 全部自动复用。
- Pros: regression surface 已经集中在 `scripts/regression-checks.mjs`，最适合 TDD。
- Cons: README / help overlay 需要同步补充新的 decorator 示例。

### Option B: 为每类 decorator 单独加预处理 helper

- Pros: 每个 wrapper 的语义更显式。
- Cons: 会把已经统一的 normalization pipeline 再次拆散，后续更容易漂移。

### Option C: 仅在 UI copy 层打补丁

- Pros: 表面改动更小。
- Cons: 无法修复 shared helper 与 CLI regression surface，未来新增显示面会继续分叉。

## Selected Design

- 采用 Option A。
- 先在 `scripts/regression-checks.mjs` 添加 curly-brace 与 book-title decorator 的 failing assertions，并同步 README / help overlay 的文案断言。
- 再扩展 `stripRunChallengeBracketedDecoratorPrefix` 的起止字符集，仅纳入本轮前两项 TODO 对应的 wrapper。
- `〔〕` / `〖〗` shell/lenticular decorator 保持在 Active，留待下一轮独立实现。

## Testing

- Failing regression:
  - `getRunChallengeSafeSidebarLabel('{挑战}击败 30 个敌人') === '击败 30 个敌人'`
  - `getRunChallengeSafeSidebarLabel('《挑战》挑战：本局：击败 30 个敌人') === '击败 30 个敌人'`
  - `getRunChallengeSafeSidebarLabel('〈本局挑战〉挑战：本局') === '未知挑战'`
- Doc regression:
  - `README.md` 与 `game.js` 操作指引都明确列出 curly-brace / book-title decorator 清洗路径。
- Final verification:
  - `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
