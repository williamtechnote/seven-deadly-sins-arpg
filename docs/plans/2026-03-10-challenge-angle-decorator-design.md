# Challenge Angle Decorator Design

## Background

当前 run challenge 标签清洗已经兼容 bracketed decorator、quoted decorator、standalone `本局：` 与 orphan separators，但上游如果改成 angle-bracket decorator（如 `<挑战>` / `＜本局挑战＞`），共享 helper 还不会把它们识别成可剥离前缀。结果是 regular / compact 摘要正文会保留 decorator 噪音，且与后续 plain-text 前缀去重链脱节。

## Goal

- 让 `<挑战>` / `＜本局挑战＞` 这类 angle-bracket decorator 进入现有 decorator 剥离链。
- 保持后续 `本局` / `挑战` plain-text 去重、leading separator 清洗与 `未知挑战` 回退不变。
- 同步 README / 操作指引与回归检查，明确 angle-bracket decorator 已纳入同一条规则。

## Options

### Option A: 扩展现有 bracketed decorator regex（recommended）

- Pros: 改动最小，直接复用已有 decorator -> prefix dedupe -> separator cleanup -> fallback 链。
- Pros: regular / compact / badge 路径都会自动受益，因为它们都走同一 helper。
- Cons: 需要同步 README / 帮助文案与回归断言里的 decorator 列表。

### Option B: 单独新增 angle-bracket 预处理 helper

- Pros: 逻辑语义更显式。
- Cons: 会把本来统一的 decorator 前缀处理拆成两段，后续维护更容易漂移。

### Option C: 只在 UI 文案层替换

- Pros: 不动 shared helper。
- Cons: 不能修复 CLI regression surface，也无法保证未来新 surface 一致。

## Selected Design

- 使用 Option A。
- `stripRunChallengeBracketedDecoratorPrefix` 扩展起止字符集，识别 ASCII `< >` 与全角 `＜ ＞`。
- 先在 `scripts/regression-checks.mjs` 写 failing assertions，覆盖 angle-bracket decorator 的正常剥离、与 plain-text 前缀混排后的 `未知挑战` 回退，以及 README / help overlay 的说明文本。
- `README.md` 与 `game.js` 的操作指引文案补一句 angle-bracket decorator 也会先剥离再继续做 `本局` / `挑战` 去重。

## Testing

- failing tests: `getRunChallengeSafeSidebarLabel('<挑战>击败 30 个敌人')` 返回 `击败 30 个敌人`；`getRunChallengeSafeSidebarLabel('＜本局挑战＞挑战：本局')` 返回 `未知挑战`。
- doc regression: README / help overlay 的 challenge 标签清洗说明新增 `<挑战>` / `＜本局挑战＞`。
- final verification:
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
