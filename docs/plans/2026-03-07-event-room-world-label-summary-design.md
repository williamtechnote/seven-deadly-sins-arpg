# Event-Room World Label Summary Design

## Context

The resolved event-room HUD already preserves a compact chosen-route line such as `效果: 迅击祷言` or `治疗: 未知选项`, but the world-space altar label still collapses to `房名 · 已结算`. That makes revisiting a cleared route less readable because the player can no longer tell which branch they picked without reading the HUD block.

## Approaches

1. Rebuild a second world-label formatter inside `game.js`.
   Trade-off: fastest local change, but it duplicates the shared route-prefix and fallback rules.

2. Reuse the shared HUD route-summary logic and expose a dedicated world-label helper.
   Trade-off: one extra export in `shared/game-core.js`, but the browser label, README, and CLI regression checks stay aligned. Recommended.

3. Keep the world label as `房名 · 已结算` and rely on the HUD only.
   Trade-off: no code change, but it does not satisfy the remaining TODO about quick backtracking recognition.

## Design

This heartbeat splits the single remaining Active TODO into three concrete follow-ups:

1. Resolved altar world labels append the chosen-route short summary.
2. Resolved altar world labels keep a stable fallback prefix when the stored route label is missing.
3. Unknown/future room types continue using the generic `已选:` prefix on the world label.

The first two are implemented this cycle. The shared helper will derive the route snippet from `buildRunEventRoomHudSummary()`, so the world label inherits the same type-specific prefixes and `未知选项` fallback without reimplementing the rules in `game.js`. If no resolved route snippet exists, the label still falls back to `房名 · 已结算`.

## Testing

- Add a regression expecting a resolved blessing altar label to render `祈愿圣坛 · 效果: 迅击祷言`.
- Add a regression expecting a resolved blessing altar label with a missing stored choice label to render `祈愿圣坛 · 效果: 未知选项`.
- Run the required syntax checks and `node scripts/regression-checks.mjs` after wiring `game.js` to the shared helper.
