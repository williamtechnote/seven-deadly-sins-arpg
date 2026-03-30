# Combat Action Bottleneck Preview Design

**Goal:** Improve the combat HUD so players can tell whether an action will actually be usable when its cooldown finishes.

## Context

The action HUD already shows one of three states per action:

- `就绪`
- raw cooldown seconds such as `0.6s`
- stamina shortage such as `差12体/0.8s`

The current gap is that cooldown fully masks stamina shortage. If an action is on cooldown and the player also lacks stamina, the HUD implies "wait for cooldown" even when the real bottleneck is "cooldown ends, then keep waiting for stamina".

## Approaches

1. Keep current cooldown-first behavior.
   Trade-off: zero implementation risk, but it preserves the misleading case we want to remove.

2. Always show both cooldown and current stamina gap.
   Trade-off: technically simple, but it is noisy because current stamina gap is not the same as the gap that matters at cooldown end.

3. Forecast the post-cooldown state.
   Trade-off: slightly more logic, but it tells the player what matters next. If cooldown finishes after stamina has already regenerated enough, keep the short cooldown label. If cooldown finishes first, show the remaining gap after that point.

## Recommendation

Use approach 3.

Per action:

- if cooldown is active and stamina will be sufficient by cooldown end, keep `0.6s`
- if cooldown is active and stamina will still be short by cooldown end, show `0.6s后差3体/0.2s`
- if regen timing is unavailable, fall back to `0.6s后差3体`

## Testing

- Add regression coverage for cooldown-plus-stamina combined gating in `scripts/regression-checks.mjs`
- Keep existing ready / cooldown-only / stamina-only assertions unchanged
- Verify the in-game HUD still consumes `buildCombatActionHudSummary(...)` from `shared/game-core.js`
