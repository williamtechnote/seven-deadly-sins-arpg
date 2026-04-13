# Portal Hover Route Memory Design

## Context

The repo already persists a compact `上轮战报` block in Hub after Boss victory. That solves the scene-transition memory loss, but it still leaves the actual portal choice slightly split: the player reads the previous route in one corner of the screen, then walks to a portal and chooses a boss door somewhere else.

The methodology fit is clear:

- `arpg-hub-return-memory-bridge.md` says the hub should preserve one compact run recap
- `arpg-hub-portal-memory-handoff.md` says the same recap should resurface at the next decision surface
- the repo prefers compact shared summaries over new full-screen review layers

## Options

1. Add a full run-history screen in Hub.
Rejected: too large for one heartbeat and heavier than the current need.

2. Expand the fixed `上轮战报` block.
Rejected: it improves persistence but still does not move the memory bridge to the portal choice point.

3. Add a compact portal-hover recap card driven by shared helper output.
Recommended: it keeps the existing `上轮战报` block intact while restating the last route where the next decision actually happens.

## Chosen Direction

Add a shared helper that builds a compact portal-hover summary from `lastRunSummary` plus the hovered portal label:

- `目标 傲慢 · 傲慢王庭`
- `上轮 淘金路线 · 带赏收官`
- `源于 豪赌 · 当前更宜稳押`

`HubScene` should detect nearby portal focus, render a small `选门回顾` panel when both a target and prior summary exist, and hide it otherwise.

## Design Notes

- Keep the recap shared-first in `shared/game-core.js`.
- Reuse the current `lastRunSummary` fields: `bossLabel`, `routeRecap`, `choiceLabel`, `recommendationReason`.
- Use the portal's existing display label for the target line.
- Keep the card non-blocking and read-only; it should aid choice, not add a new interaction.

## Success Criteria

- Hovering near a portal with a stored last-run summary shows a compact `选门回顾` card.
- The card leads with the current portal target and reuses the stored route recap/source choice.
- No summary means no hover card.
- Regression coverage proves both the shared helper output and the HubScene hover/render wiring.
