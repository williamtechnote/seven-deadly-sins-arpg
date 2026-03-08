# Sidebar Runtime Badge Fallback Design

## Background

`TODO.md` 里剩余的 ultra-tight 验证项指向了两个同源问题。第一，右侧 HUD 侧栏的 `compact / ultra-compact / ultra-tight` 路径当前按固定逻辑画布尺寸取值，运行时基本不会进入最近几轮新增的更紧分档。第二，完成态轻量挑战徽记虽然已经能回退到 `完成`，但在更极端的共享标题预算里还缺一个“宁可静默也不让 Phaser 再截断”的最终策略。

## Goal

- 把剩余验证任务拆成 3 个明确 heartbeat 子项。
- 让侧栏分档与 badge 宽度预算真正跟随实际显示尺寸进入更紧档位。
- 为完成态 badge 增加最终静默回退，优先保护“本局词缀”标题的截断稳定性。

## Options

### Option A: 基于实际显示尺寸驱动侧栏分档与宽度预算，并在完成态 badge 预算不足时静默隐藏（recommended）

- Pros: 直接修正根因，让现有 compact / ultra-compact / ultra-tight 规则在运行时可达。
- Pros: 改动集中在 shared helper 和 `UIScene` 的取值路径，便于回归锁住。
- Cons: README / 帮助文案需要同步说明“实际显示尺寸”而不是单纯逻辑视口。

### Option B: 保持运行时继续使用固定逻辑画布，只把阈值整体上移到 `1024x768`

- Pros: 改动更少。
- Cons: 只是重新命名阈值，不会反映实际缩放后的物理可读性，也会让最近几轮“更紧预算”设计失真。

### Option C: 保持现状，只为完成态 badge 新增最终静默回退

- Pros: 触点最少。
- Cons: 只能缓解最终一档完成态截断，不能解决更大范围的分档不可触发问题。

## Selected Design

- 使用 Option A。
- 子项 1：在 shared 层新增“侧栏实际显示尺寸/宽度预算” helper，并让 `UIScene` 用它来决定 viewport tier 与 badge heading budget，让 compact / ultra-compact / ultra-tight 在运行时可触发。
- 子项 2：在轻量挑战徽记 helper 中加入完成态最终静默回退。如果 `完成` 都超出当前 badge 预算，就返回空 badge，把标题预算全部还给“本局词缀”。
- 子项 3：补充回归守卫，覆盖实际显示尺寸驱动的 tier / width budget，以及完成态最终静默回退。

## Testing

- 在 `scripts/regression-checks.mjs` 先写 failing tests，验证 shared helper 会基于实际显示尺寸收紧侧栏宽度预算，并验证完成态 badge 在预算不足时静默。
- 为 `game.js` 增加 source-hook 断言，确认 `UIScene` 使用显示尺寸 helper，而不是继续直接依赖固定逻辑画布宽高。
- README / 帮助文案同步说明 ultra-compact 轻量挑战徽记的实际显示尺寸触发与完成态最终静默回退。
- 最终运行：`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`。
