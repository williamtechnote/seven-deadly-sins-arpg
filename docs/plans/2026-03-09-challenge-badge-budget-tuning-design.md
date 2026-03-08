# Challenge Badge Budget Tuning Design

## Background

`TODO.md` 里与 ultra-compact 轻量挑战徽记相关的剩余 Active 任务已经收敛到同一个问题：当挑战摘要和词缀正文都被隐藏后，挂在“本局词缀”标题后的轻量徽记仍会与标题争抢同一行横向预算。当前实现虽然已经支持更短的 `12/30` / `完成` 回退，但 heading 布局本身仍保留较高的 badge 宽度占比和固定 gap，导致极端窄高视口下标题本体被过早压缩。

## Goal

- 把剩余 Active TODO 拆成 3 个明确 heartbeat 子项。
- 先用最小安全改动收紧 heading 预算：降低 badge 最大宽度占比，并缩小 badge 与标题之间的固定间距。
- 保留更细的“按更紧预算继续分档”评估为 follow-up，不在这一轮继续扩大规则复杂度。

## Options

### Option A: 固定收紧 badge 宽度占比 + 固定收紧 gap（recommended）

- Pros: 改动最小，只触及现有 heading budget 逻辑，不改变 badge 触发条件和文案分级。
- Pros: 容易通过 shared helper + source-hook 回归锁住。
- Cons: 仍属于统一阈值，不能覆盖所有未来更极端预算组合。

### Option B: 按可用宽度做多档 badge 布局策略

- Pros: 可以对更窄预算做更细的 share/gap 分档。
- Cons: 复杂度更高，当前只有一个 follow-up TODO，不需要现在把策略引擎做满。

### Option C: 给标题设置绝对最小宽度，剩余预算全部让 badge 自适应

- Pros: 标题可读性保护最强。
- Cons: 会把 badge 裁剪逻辑进一步绑到标题测量结果上，本轮没有足够收益。

## Selected Design

- 使用 Option A。
- 子项 1：把 ultra-compact heading 中挑战 badge 的最大宽度占比再下调一档，让“本局词缀”标题默认拥有更高的保底预算。
- 子项 2：把 badge 与标题之间的固定 gap 再收紧一档，减少共享 heading 的纯空白损耗。
- 子项 3：保留 follow-up，只继续评估是否还需要按更紧预算进一步细分 badge 宽度占比或 gap。

## Testing

- 在 `shared/game-core.js` 新增轻量挑战徽记 heading budget helper，并在 `scripts/regression-checks.mjs` 里验证 ultra-compact 档位的 badge `maxWidth` / `gap`。
- 为 `game.js` 增加 source-hook 断言，确认 `UIScene` 通过共享 helper 读取 badge heading budget，而不是继续硬编码 `0.42` 和 `8`。
- README / 帮助文案同步说明 ultra-compact 轻量徽记会进一步收紧 badge 预算与间距，以优先保住“本局词缀”标题扫读。
- 最终运行：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
