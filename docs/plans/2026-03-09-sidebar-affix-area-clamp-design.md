# Sidebar Affix And Area Clamp Design

## Background

`TODO.md` 当前只剩一条宽泛的“继续评估右侧固定侧栏剩余长文案”任务。结合现有 `UIScene` 实现，最直接的剩余风险点有三处：

- `runModifierText` 仍直接拼接 `1. 词缀名` 多行文案，没有经过 Phaser 实际测量；
- `areaNameText` 仍直接输出区域名，长房间名会横向挤出右侧侧栏；
- 后续若再往同一区域追加长文案，仍需要决定是否继续沿用同一套测量路径。

## Goal

- 让右侧固定侧栏里的本局词缀列表在长词缀名下仍保持在 HUD 宽度内。
- 让区域名在超长房间标题下优先按 Phaser 实测宽度收紧，而不是直接溢出。
- 保留一条后续评估项，避免本轮 heartbeat 扩到尚未出现的文案路径。

## Options

### Option A: 单独缩短词缀名和区域名

- Pros: 改动最小。
- Cons: 继续依赖手写短名，后续新文案仍会重复出现相同问题。

### Option B: 复用现有侧栏测量 helper，把词缀列表与区域名接入实测钳制（recommended）

- Pros: 复用 `UIScene` 已有的侧栏隐藏测量节点和 `clampTextToWidth` / `clampTextLinesToWidth`。
- Pros: 保持“Phaser 实测优先、纯逻辑 helper 可回归”的现有模式。
- Cons: 需要补 style key 和回归检查。

### Option C: 重做整个右侧侧栏布局

- Pros: 理论上给更多空间。
- Cons: 超出本轮 TODO 范围，也会把一次心跳任务扩成版式重构。

## Selected Design

- 采用 Option B。
- 子项 1：为 `runModifierText` 接入 Phaser-backed 多行测量与宽度钳制。
- 子项 2：为 `areaNameText` 接入 Phaser-backed 单行测量与宽度钳制。
- 子项 3：保留“是否继续扩到未来新增长文案”的评估项，不在本轮实现。

用户本轮 heartbeat 已明确要求“brainstorm 3 then implement earliest 2”，因此本设计把 Active TODO 拆成 3 个子项，并按顺序直接执行前 2 项。

## Testing

- 先在 `scripts/regression-checks.mjs` 增加 source-hook 断言，让词缀列表和区域名的测量接线先失败。
- 再补 `README.md` / 帮助文案说明，保证固定右侧侧栏的剩余长文案范围被文档覆盖。
- 最后运行规定命令：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
