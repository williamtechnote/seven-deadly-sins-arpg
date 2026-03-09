# Challenge Summary Fallbacks Design

## Background

`TODO.md` 当前没有 Active 项，但最近多轮 heartbeat 都在收紧右侧固定侧栏里“本局挑战”与“本局词缀”之间的极窄视口竞争。当前轻量 badge 已经具备完整的 `完成+奖励 -> 完成 -> 静默隐藏` / `进12/30 -> 12/30 -> 进12 -> 静默隐藏` 链路，但 challenge 正文在 `ultraCompact` 档位下仍只生成一条固定短句，再交给通用省略逻辑处理。

这会留下一个剩余缺口：当 challenge 正文还没被整体隐藏时，`挑战 12/30 · +90金` 或 `挑战完成 · +90金` 这类单行摘要会直接进入通用截断，而不会先走更符合语义的短句回退。

## Goal

- 为 `ultraCompact` 可见态 challenge 单行摘要增加语义化短句回退，优先稳住“进度 / 完成”主信息。
- 复用现有 badge 的宽度测量思路，避免再引入第二套“先截断再猜测”的分支。
- 保留一条后续 TODO，继续覆盖更极端但本轮价值较低的摘要边缘场景。

## Options

### Option A: 继续依赖现有通用省略

- Pros: 不改 helper。
- Cons: 一旦进入省略，`挑战…` 这类结果不如显式回退稳定，也和 badge 的多级短句策略不一致。

### Option B: 给 `ultraCompact` challenge 单行摘要增加 width-aware 语义回退（recommended）

- Pros: 改动集中在 `shared/game-core.js`，和 badge 的现有宽度预算模型一致。
- Pros: 回归检查可以直接验证具体短句链路，而不是依赖 Phaser 最终截断结果。
- Cons: 需要把宽度测量 helper 稍微抽象成 challenge 正文和 badge 共用。

### Option C: 直接提前隐藏 challenge 正文，只保留标题 badge

- Pros: 逻辑更简单。
- Cons: 会让可见摘要更早消失，损失信息密度，不符合“先压缩再隐藏”的现有设计方向。

## Selected Design

- 采用 Option B。
- 子项 1：为 `ultraCompact` 进行中 challenge 单行摘要增加 `挑战 12/30 · +90金 -> 挑战 12/30 -> 12/30` 的宽度回退链路。
- 子项 2：为 `ultraCompact` 完成态 challenge 单行摘要增加 `挑战完成 · +90金 -> 挑战完成 -> 完成` 的宽度回退链路。
- 子项 3：保留“超大奖励数值下是否要额外保留 `+999金` 信息”的 follow-up，不在本轮实现。

用户本轮 heartbeat 已明确要求“brainstorm 3 then implement earliest 2”，因此本设计直接把 3 个 follow-up 写入 `TODO.md`，并按顺序实现前 2 项。

## Testing

- 先在 `scripts/regression-checks.mjs` 为进行中 / 完成态单行摘要添加 width-aware 回退断言，让回归先失败。
- 再在 `shared/game-core.js` 实现最小 helper 改动，并同步 `README.md` / 帮助文案。
- 最后运行固定验证命令：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
