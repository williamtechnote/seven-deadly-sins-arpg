# Event Room Unknown-Type Fallback Copy Design

## Context

Resolved event-room HUD lines already preserve the generic `已选:` prefix for unknown or future room types. The remaining gap is when an old save or future content path has the chosen-route label but no settlement text. In that case the resolved HUD currently drops the settlement half entirely, which makes the one-line summary look incomplete and unstable.

## Approaches

1. Patch only the HUD renderer in `game.js`.
   Trade-off: smallest runtime change, but the browser UI and CLI regressions would keep separate fallback rules.

2. Add the fallback in `shared/game-core.js` and verify it through regression fixtures.
   Trade-off: one shared source of truth, keeps browser HUD and CLI checks aligned. Recommended.

3. Keep the runtime behavior and only document the missing-copy edge case.
   Trade-off: cheapest, but leaves the visible HUD gap unchanged.

## Design

Keep the resolved unknown-type prefix on `已选:` and add a compact settlement fallback of `结算待同步` when a resolved event room has no stored `resolutionText`. This fallback should live in the shared HUD summary builder so both the browser HUD and Node regression checks see the same text.

This heartbeat splits the original TODO into three concrete subtasks:

1. `buildRunEventRoomHudSummary()` returns `结算待同步` for resolved unknown-type rooms whose settlement text is missing.
2. `buildRunEventRoomHudLines()` keeps the merged one-line format as `已选: <label> · 结算待同步`.
3. A later cycle can decide whether fully missing route labels should also get a generic label fallback.

## Testing

- Add a failing regression for the resolved unknown-type summary helper when `resolutionText` is empty.
- Add a failing regression for the resolved merged HUD line in the same scenario.
- Re-run the required syntax and regression command after implementation.
