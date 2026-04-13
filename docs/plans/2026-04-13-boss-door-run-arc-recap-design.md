# Boss-Door Run-Arc Recap Design

## Context

`缓冲战 / 高压战 / 淘金战` now read clearly inside room 3: players see the route at shrine choice, keep it through settlement, receive an entry cue, feel a payoff beat, and get a clear-time recap when the Boss door opens. That still leaves one gap in the segment: once the clear-time floating text is gone, the door itself goes back to a generic `Boss: <name>` label. The route stops speaking right at the handoff into the next major fight.

The repo's methodology docs point to a high-ROI follow-up:

- short-run choices should stay legible across the next 1-3 rooms
- delayed consequences still need a visible signal
- run-shaping feedback should prefer existing surfaces over new bespoke HUD

## Options

1. Add another one-shot floating text near the Boss door.
Rejected: the repo already has entry, payoff, and clear floating cues. Another transient burst would repeat the same channel instead of strengthening the transition surface itself.

2. Add a new persistent route panel near the Boss door.
Rejected: heavier UI than this heartbeat needs, and likely to compete with the existing boss label.

3. Reuse the existing Boss-door label with one shared route-recap line after room 3 is cleared.
Recommended: it turns the current transition surface into a segment summary, keeps the change deterministic, and does not require a new HUD block.

## Chosen Direction

Add a shared helper that turns the routed encounter profile into a short Boss-door run-arc recap:

- `缓冲路线 · 稳线迎战`
- `高压路线 · 顶压迎战`
- `淘金路线 · 带赏迎战`

`LevelScene` should keep the existing top line `Boss: <name>`. Once room 3 is fully cleared, the Boss-door label becomes two lines: the boss name plus the shared route recap. Before clear, it stays unchanged.

## Design Notes

- Keep the helper in `shared/game-core.js`.
- Base the recap on encounter profile / payoff moment, not on ad-hoc scene copy.
- Do not append recommendation-specific echoes here. The Boss-door beat is a segment recap, not another room-3 tactic burst.
- README and help overlay should mention that the Boss door now preserves the route identity after the room-clear floating text fades.

## Success Criteria

- After room 3 is cleared, the Boss-door label keeps a compact route recap under `Boss: <name>`.
- Before clear, the Boss-door label remains unchanged.
- The recap is shared-helper driven and regression tested.
- The feature improves run-arc readability without adding a new persistent HUD block.
