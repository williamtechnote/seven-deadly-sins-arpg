# Event Room Known-Type Fallbacks Design

## Context

Resolved event-room HUD copy already handles unknown or future room types when persisted labels or settlement text are missing. Known room types still have a gap when older saves lose one of those persisted fragments after the pool definition changes: the type-specific prefix can disappear, or the merged one-line summary can degrade into a plain `结算:` line.

## Approaches

1. Patch the runtime HUD text only in `game.js`.
   Trade-off: fixes the browser view, but leaves the shared formatter and CLI regressions out of sync.

2. Extend the shared event-room HUD formatter in `shared/game-core.js` and lock the behavior with regression fixtures.
   Trade-off: one source of truth for runtime HUD, saves, and CLI coverage. Recommended.

3. Leave known-type rooms as-is and only document the edge case.
   Trade-off: lowest effort, but resolved saves can still lose their room-type cue in the HUD.

## Design

Keep the existing resolved room-type prefixes (`效果:`, `交易:`, `治疗:`) even when a known room can no longer recover its chosen option label from persisted data. In those cases, the shared summary helper should synthesize `未知选项` for the route half, just as unknown rooms already do with the generic `已选:` prefix.

Likewise, when a resolved known room still has a chosen route but has lost its settlement text, the shared formatter should synthesize `结算待同步` so the merged HUD line stays stable. This heartbeat will implement the first two concrete follow-ups:

1. Blessing/risk-buff style rooms keep `效果: 未知选项` when the stored choice label is missing.
2. Trade rooms keep `交易: <label> · 结算待同步` when settlement text is missing.
3. A later heartbeat can explicitly lock the double-fallback line for healing rooms with dedicated regression coverage.

## Testing

- Add a failing regression for a resolved known blessing room with a missing stored label and a retired choice key.
- Add a failing regression for a resolved known trade room with missing settlement text.
- Re-run the required syntax and regression command after implementation.
