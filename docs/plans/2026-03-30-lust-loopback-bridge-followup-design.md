# Lust Loopback Bridge Follow-Up Design

`魅惑女妖` phase 3 already gives `illusion -> mirageDance` a longer directed light-pressure handoff. The remaining pacing risk is the next loopback into `reverseControl`, where the selector can still feel too eager to return to a major special after `mirageDance`.

## Approaches

1. Extend only `mirageDance` recovery again.
This delays the next loopback, but it only helps after one attack and leaves the attack list unchanged.

2. Extend the `mirageDance -> reverseControl` directed bridge by one more `dash` / `charmBolt` pair.
This directly targets the active TODO, preserves the existing phase-3 pacing model, and keeps the next loop visibly lighter before another major special.

3. Raise shared major-special recovery again.
This is broader, but the current active TODO specifically points back to the loopback bridge, so it is less precise than needed for this pass.

## Recommendation

Choose approach 2. Add one more `dash` / `charmBolt` pair after `mirageDance`, then lock the new count and README wording with regression checks.

## Scope

- Update Lust phase-3 attack ordering in `data.js`.
- Extend the loopback bridge assertions in `scripts/regression-checks.mjs`.
- Refresh README wording so the boss pacing note matches the new contract.
- Record the TODO split from observation to implementation.
