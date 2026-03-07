# Event Room Dual-Fallback Design

## Context

Unknown or future event-room types already keep stable HUD output when either the stored option label or the settlement text is missing. The remaining gap is older or malformed saves where both fields are empty at the same time. In that path, the resolved HUD currently drops the chosen-route line entirely and leaves no merged third line.

## Approaches

1. Patch the browser HUD rendering only.
   Trade-off: runtime output changes, but the shared helper and CLI regressions still disagree.

2. Extend the shared formatter in `shared/game-core.js` and lock it with regression fixtures.
   Trade-off: one source of truth for browser HUD, saves, and CLI checks. Recommended.

3. Document the edge case and defer behavior changes.
   Trade-off: cheapest now, but leaves a visible regression in malformed or future-save paths.

## Design

Keep the generic `已选:` prefix for resolved unknown/future event-room types and let the shared summary builder synthesize both fallback fragments when the persisted data is incomplete:

1. Missing chosen label falls back to `未知选项`.
2. Missing settlement text falls back to `结算待同步`.
3. The resolved HUD line builder keeps the merged format as `已选: 未知选项 · 结算待同步`.

This heartbeat splits the remaining TODO into three concrete subtasks and implements the first two while also syncing docs/tests as part of the same change set.

## Testing

- Add a failing summary regression for the combined missing-label and missing-settlement case.
- Add a failing merged-HUD-line regression for the same fixture.
- Re-run the required syntax checks and `node scripts/regression-checks.mjs` after implementation.
