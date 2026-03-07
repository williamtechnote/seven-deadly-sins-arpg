# Event Room Missing-Option Fallback Design

## Context

Unknown or future event-room types already keep the generic `已选:` prefix and can fall back to `结算待同步` when settlement text is missing. The last visible gap is older or malformed saves that still know the room key but have lost the persisted chosen-label text. In that state the resolved HUD drops the route half entirely and degrades to `结算: ...`, which is less stable than the other fallback paths.

## Approaches

1. Add the label fallback only in `game.js`.
   Trade-off: the browser HUD improves, but the shared formatter and CLI regression checks would still disagree.

2. Add the fallback in `shared/game-core.js` and lock it with regression fixtures.
   Trade-off: one shared source of truth for browser HUD and CLI checks. Recommended.

3. Keep the current runtime behavior and only document the edge case.
   Trade-off: cheapest, but leaves a visible regression path in old/future saves.

## Design

Keep the unknown-type resolved prefix on `已选:` and add a chosen-label fallback of `未知选项` when a resolved event room has no stored `selectedChoiceLabel` and the current pool can no longer recover it from `selectedChoiceKey`. This should be handled inside the shared HUD summary builder so both runtime HUD output and regression checks use the same copy.

This heartbeat splits the remaining TODO into three concrete subtasks:

1. `buildRunEventRoomHudSummary()` returns `已选: 未知选项` for resolved unknown-type rooms whose chosen label is missing.
2. `buildRunEventRoomHudLines()` keeps the merged one-line format as `已选: 未知选项 · <compact settlement>` when settlement text still exists.
3. A later cycle can cover the full dual-fallback line when both chosen label and settlement text are missing.

## Testing

- Add a failing regression for the resolved unknown-type summary helper when `selectedChoiceLabel` is empty.
- Add a failing regression for the resolved merged HUD line in the same scenario while keeping settlement text present.
- Re-run the required syntax and regression command after implementation.
