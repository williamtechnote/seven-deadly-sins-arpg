# Challenge Tortoise-Shell Brackets Design

## Background

`TODO.md` 当前只剩一条 active 的 challenge decorator 清洗任务，而且条目里的 Unicode 命名与实际字符 `〘〙` 不一致。shared challenge label helper 已覆盖 `〖〗`、`〔〕`、`《》`、`｢｣`、`〝〞` 等 wrapper，但 `〘〙` 与相邻的 `〚〛` 仍未进入同一条 decorator 剥离链，导致这两组复制脏输入还不能稳定复用既有 `本局` / `挑战` 去重与 `未知挑战` 回退。

## Goal

- 让 `〘挑战〙击败 30 个敌人` / `〘本局挑战〙挑战：本局` 走通既有 decorator 清洗链。
- 让 `〚挑战〛击败 30 个敌人` / `〚本局挑战〛挑战：本局` 走通同一条清洗链。
- 同步 README、操作指引与 CLI regression checks，对新增 wrapper 家族建立明文契约。

## Options

### Option A: 扩展 shared decorator pair 表，复用现有 prefix cleanup 链（recommended）

- Pros: 改动集中在 `shared/game-core.js`，regular / compact / ultra-compact / badge / docs 全部自动继承。
- Pros: 两个 bracket family 可以一次用同一轮 TDD 收口。
- Cons: 需要同步 `README.md`、`game.js` 和 `scripts/regression-checks.mjs` 的长说明。

### Option B: 仅在 `isRunChallengePrefixToken` 里特判两组 wrapper

- Pros: 表面改动更小。
- Cons: decorator 家族会分叉；后续新增 wrapper 仍要继续补条件分支。

### Option C: 只改文档，不改 helper

- Pros: 无运行时代码风险。
- Cons: 无法满足 TODO，也会让回归说明继续偏离真实行为。

## Selected Design

- 采用 Option A。
- 先在 `scripts/regression-checks.mjs` 为 `〘〙` 与 `〚〛` 分别补两组 RED case：一组验证正文保留，一组验证与 repeated plain-text prefixes 叠加后仍能回退 `未知挑战`。
- 再把这两组 bracket pair 加入 `shared/game-core.js` 的 `RUN_CHALLENGE_DECORATOR_PAIRS`。
- 最后同步 `README.md` 与 `game.js` 的 grouped decorator 文案，确保操作指引与回归断言都显式提到这两组 wrapper。

## Testing

- 先跑新增 regression cases，确认在实现前失败。
- 实现后运行用户指定命令：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
