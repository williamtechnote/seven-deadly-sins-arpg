# Healing Event-Room Double-Fallback Design

## Context

Resolved event-room HUD copy already preserves stable fallbacks for unknown room types, and known room types keep their type-specific prefixes when only one persisted fragment is missing. The remaining gap is the healing-room path where an older or malformed save can lose both the stored option label and settlement text at the same time while still keeping a known choice key. In that case, the shared formatter currently reconstructs the label from the live pool and shows a partial recovery instead of the explicit fallback requested by the TODO.

## Approaches

1. Keep recovering the live choice label from the pool whenever the choice key still matches.
   Trade-off: lowest code churn, but the resolved HUD no longer reflects that both persisted summary fragments were actually missing.

2. Treat the healing-room double-missing path as an explicit fallback case in the shared formatter.
   Trade-off: one narrow rule in `shared/game-core.js`, but browser HUD and CLI regressions stay aligned. Recommended.

3. Patch only the browser HUD rendering in `game.js`.
   Trade-off: runtime output changes, but the shared helper contract and regression suite diverge.

## Design

When a resolved `疗愈泉眼` entry is missing both `selectedChoiceLabel` and `resolutionText`, the shared HUD summary helper should stop recovering the visible choice label from the live pool and instead synthesize the full fallback pair:

1. Route summary stays `治疗: 未知选项`.
2. Settlement fallback stays `结算待同步`.
3. The merged HUD line remains `治疗: 未知选项 · 结算待同步`.

This keeps the healing-room path consistent with the TODO wording and makes the persisted-data gap obvious instead of silently reconstructing a label from current definitions.

## Testing

- Add a red regression for `buildRunEventRoomHudSummary()` using a resolved healing room with a valid choice key but missing stored label and settlement text.
- Add a red regression for `buildRunEventRoomHudLines()` expecting the merged `治疗: 未知选项 · 结算待同步` line from the same fixture.
- Re-run the required syntax checks and `node scripts/regression-checks.mjs` after the formatter change.
