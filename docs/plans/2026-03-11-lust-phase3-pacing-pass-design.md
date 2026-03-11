# Lust Phase 3 Pacing Pass Design

**Date:** 2026-03-11

## Goal

Turn the single active `魅惑女妖` phase 3 observation into three ordered backlog items, then implement the first two with the smallest possible runtime surface.

## Prioritized Scope

1. Lengthen `reverseControl`'s explicit recovery window again so the player gets a clearer beat after the projectile collapse.
2. Extend the directed light-pressure bridges before `illusion` and `mirageDance` so the second-round loop spends longer in `charmBolt` / `dash`.
3. Leave one observation item active for any remaining live pacing density.

## Options

### Option A: Data and constant tuning only

Adjust the phase-3 attack order in `data.js` and the `reverseControl` recovery constant in `game.js`, then lock both with regression checks.

Pros:
- Minimal code churn
- Matches the existing Lust pacing system, which is already data-first
- Keeps risk low

Cons:
- Selector behavior remains generic rather than explicitly boss-specific

### Option B: Add a new selector-only bridge rule

Teach `_pickPhaseAttack()` about another layer of Lust-specific bridge metadata.

Pros:
- More deterministic bridge control

Cons:
- More moving parts than this pass needs
- Higher regression surface for a small pacing adjustment

## Recommendation

Use Option A. The current pacing stack already exposes enough data-driven control; this pass only needs one more recovery bump and longer bridge segments.

## Testing Strategy

- Update regressions first so they fail on the old phase-3 attack list and old `reverseControl` recovery constant.
- Implement the minimal data/runtime/doc changes.
- Run the required syntax checks plus `node scripts/regression-checks.mjs`.
