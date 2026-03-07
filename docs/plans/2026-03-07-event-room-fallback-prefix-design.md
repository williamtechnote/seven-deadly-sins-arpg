# Event Room Unknown-Type Fallback Prefix Design

## Context

The current event-room HUD formatter already uses type-specific resolved prefixes for blessing, risk-buff, trade, and healing rooms. The remaining TODO is the fallback path: if a future or malformed event room resolves with an unknown `type`, the HUD should keep the generic `已选:` prefix instead of drifting to one of the specialized labels.

## Approaches

1. Patch only the Phaser HUD rendering in `game.js`.
   Trade-off: smallest visible change, but the browser UI and CLI regression checks would keep duplicating formatting logic.

2. Keep the fallback logic in `shared/game-core.js` and cover it with regression checks.
   Trade-off: one shared helper change, but runtime HUD output and Node checks stay aligned. Recommended.

3. Hardcode fallback behavior in regression fixtures only.
   Trade-off: no runtime guarantee, so the visible HUD could still regress.

## Design

Keep `getRunEventRoomResolvedPrefix()` as the single source of truth. Known types continue to map to `效果 / 交易 / 治疗`; any unknown type keeps the generic `已选` fallback. Add regression coverage for both `buildRunEventRoomHudSummary()` and `buildRunEventRoomHudLines()` using a pool override with a custom unknown-type room so the fallback stays enforced without mutating the shipped event-room pool.

README should describe that unknown/future event-room types keep the generic `已选:` prefix in the resolved HUD summary.

## Testing

- Add a failing regression for the unknown-type summary route line.
- Add a failing regression for the merged resolved HUD line.
- Re-run the required syntax and regression command after implementation.
