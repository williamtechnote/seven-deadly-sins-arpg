# Event Room Boss Matchup Recommendation Design

## Goal

Make event-room recommendations account for the current target Boss posture, not only the player's immediate HP/cooldown/loadout state.

## Context

The shared recommendation helper already does useful contextual weighting:

- HP thresholds can recommend safer or riskier shrine routes
- cooldown/stamina bottlenecks can recommend action-tempo routes
- loadout and status hooks can recommend weapon/status routes

That means the helper already answers `当前局缺什么`. The remaining gap is `对这位 Boss 缺什么`.

The repo's methodology docs point directly at this:

- event-room choices should solve the next concrete run problem, not only show raw numbers
- contextual weighting should beat static value
- the next iteration should eventually reflect boss-matchup synergy in the same lightweight language

Right now, the player can read a compact boss posture at portal focus, then immediately lose that framing once the run reaches an event room. The event-room recommendation footer becomes locally smart but matchup-blind.

## Options

1. Add boss-specific copy for every event-room choice.
Rejected: too broad, too manual, and likely to drift across shared/runtime/doc surfaces.

2. Leave event-room recommendations unchanged and rely on the hub `选门参考`.
Rejected: the hub helps with portal choice, but it does not answer the next shrine/event decision inside the run.

3. Add a narrow boss-aware weighting pass inside the existing shared recommendation helper.
Recommended: it reuses the current recommendation surface, keeps the reasoning compact, and stays deterministic enough for regression coverage.

## Chosen Direction

Extend `buildRunEventRoomChoiceRecommendation` so it can read `state.bossKey` and, when no stronger live-state recommendation already exists, apply a small set of high-confidence boss-matchup tiebreakers.

Scope this heartbeat to three already-strong recommendation lanes:

- `祈愿圣坛`
  - favor `复苏祷言` for pressure/sustain bosses like `暴怒 / 暴食` with `目标Boss更宜回体`
  - favor `迅击祷言` for拆位-heavy bosses like `嫉妒` with `目标Boss更宜拆位`
- `战技圣坛`
  - favor `游步修习` for read/counter bosses like `傲慢 / 色欲` with `目标Boss更宜稳拍`
- `武备圣坛`
  - favor `离弦修习` for chase/backline bosses like `贪婪` with `目标Boss更宜追后`

Key rules:

- boss-aware weighting is a fallback, not a replacement for stronger HP/cooldown/loadout signals
- the reason text must stay short and consistent with existing posture vocabulary
- persisted recommendation reasons should remain useful after selection, so routed encounter echo can still confirm the same logic

## Design Notes

- Keep boss posture mapping in shared logic so README, runtime, and regression checks stay aligned.
- Reuse the existing recommendation footer instead of adding a new boss-only widget.
- Thread `bossKey` through the existing LevelScene preview state builder; do not create a separate scene-only recommendation path.
- Extend encounter-echo mappings only for the boss-aware reasons introduced in this heartbeat.

## Testing

- Add helper assertions for boss-aware recommendations in `scripts/regression-checks.mjs`
- Add a resolution assertion proving the persisted recommendation reason survives when the chosen option matches the boss-aware recommendation
- Add a routed encounter echo assertion proving the persisted boss-aware reason still produces a readable follow-up
- Add a runtime-source assertion proving `_buildRunEventChoicePreviewState()` now passes `bossKey`

## Assumption

This heartbeat is running in a required non-interactive automation flow, so the design is treated as self-approved for this cycle.
