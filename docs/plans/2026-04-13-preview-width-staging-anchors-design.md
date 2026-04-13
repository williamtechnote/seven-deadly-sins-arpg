# Preview Width Staging Anchors Design

## Context

GitHub `main` 已经把 shrine-side forecast 压成 `下间缓冲 · 先稳前排` / `下间高压 · 先拆夹角` / `下间淘金 · 先盯后排`，解决了“第一拍先做什么”的核心问题。

现在的缺口不是缺信息，而是所有 surface 都被锁成同一档最短文案。choice panel 这类更宽 surface 其实还能承载一层 compact staging anchor，但当前 shared helper 没有宽度分层，所以 richer framing 要等到 `遭遇:` 回执或 room-entry preview 才出现。

## Options

1. Keep the compact preview everywhere.
Rejected: 安全但浪费了更宽 surface，也让 shrine-side richer forecast 永远退到 entry 之后。

2. Restore the full staging anchor everywhere.
Rejected: 会把窄 sidebar / HUD 行重新塞回长句，破坏上一轮刚建立的 objective-first contract。

3. Make the shared preview width-aware.
Recommended: 宽档恢复 `双低压 / 三敌齐压 / 双赏金`，窄档继续保住 `下间X · 首拍目标`。

## Chosen Direction

Add one shared width-aware preview formatter that can choose between:

- full: `下间高压 · 三敌齐压 · 先拆夹角`
- compact: `下间高压 · 先拆夹角`

Wire it into:

- choice panel option rows with a wide-budget preference
- event-room HUD/sidebar summary with actual width measurement

Leave `遭遇:` receipt, room-entry preview, and room-entry objective cue unchanged.

## Success Criteria

- choice panel regains the preview-only staging anchor on wide surfaces.
- sidebar summary keeps the compact preview on tight budgets and upgrades on wider budgets.
- shared helper stays silent for unknown profiles.
- README, TODO, regression checks, and runtime use the same preview ladder.

## Assumption

This heartbeat is running non-interactively, so the design is treated as approved once recorded.
