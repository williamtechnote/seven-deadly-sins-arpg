# Upgrade Layer Anchors Design

## Context

The current blacksmith upgrade preview already surfaces both purchased and next-step payoff on non-max weapons via copy like `累计+下次 · 累计伤害+4 / 本次伤害+5`. That solves the bigger readability gap, but once width gets slightly tighter the helper falls back too quickly to `累计伤害+4 / 本次伤害+5` and then to a single layer. The player keeps the numbers, but loses the meaning of which half is already bought versus which half is the next jump.

This is now the main information-hierarchy gap in the blacksmith row: the upgrade lane is doing the right job, but it drops the layer anchor before it drops the second payoff layer.

## Options

1. Rename the heading to `已购+下次` or `累计+下跳`.
Rejected: wording preference is subjective and only saves a few glyphs. It does not materially improve the fallback ladder.

2. Keep the current heading and accept that narrow widths lose the layer label first.
Rejected: this preserves the current regression but still lets the most important semantic distinction disappear too early.

3. Add an intermediate compact layer-anchor fallback such as `累计+4 / 下次+5`.
Recommended: it preserves both payoff layers and their meaning using the same real stat deltas, gives the width ladder a stronger middle step, and stays deterministic inside the existing shared helper.

## Chosen Direction

Keep the current full-width summary `累计+下次 · 累计伤害+4 / 本次伤害+5` when space allows. For narrower widths, add an intermediate fallback that rewrites the first visible cumulative and next segments into compact value-pairs like `累计+4 / 下次+5` before dropping to the existing unlabeled or single-layer summaries.

Implementation stays in `shared/game-core.js` inside `buildWeaponUpgradePreviewSummary`, using the already-derived cumulative and next benefit segments rather than inventing new upgrade math. `game.js` should keep consuming the shared helper unchanged. README and the in-game help overlay should describe that narrow non-max rows now preserve both layer anchors in compact form before collapsing to one layer.

## Success Criteria

- Non-max upgrade rows still show the full `累计+下次` summary when width allows.
- A narrower intermediate width returns `累计+4 / 下次+5` instead of immediately dropping the layer distinction.
- Existing max-level and single-layer fallbacks remain intact.
- Regression coverage locks the helper output plus the README/help copy contract.
