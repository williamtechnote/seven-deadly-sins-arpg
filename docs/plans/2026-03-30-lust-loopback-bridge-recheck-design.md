# Lust Loopback Bridge Recheck Design

`魅惑女妖` phase 3 already has a longer shared `majorSpecial` recovery window, but the current active TODO still reads as an observation: if the return path from `mirageDance` into the next `reverseControl` remains too eager, decide whether to widen the loopback bridge again.

## Approaches

1. Extend shared `majorSpecial` recovery again.
This delays every major-special re-entry, but the last completed pass already targeted that guard directly.

2. Extend `mirageDance`'s explicit recovery again.
This would only stretch one timing segment and overlaps with the previous recovery-specific tuning pass.

3. Extend the `mirageDance -> reverseControl` directed light-pressure bridge again.
This keeps the adjustment on the exact return path named by the current observation, preserves the existing selector hooks, and gives the loop more `dash` / `charmBolt` breathing room before the next control-heavy special.

## Recommendation

Choose approach 3. Add one more `dash` / `charmBolt` pair after `mirageDance` in Lust phase 3 so the loopback into the next `reverseControl` yields to light pressure for one more beat before the major-special cycle can re-enter.

## Scope

- Promote the observation-style active TODO into a concrete loopback-bridge implementation item, then add the next observation after delivery.
- Lock the new loopback length and README wording in `scripts/regression-checks.mjs`.
- Extend the phase-3 `attacks` list in `data.js` by one more `dash`, `charmBolt` pair after `mirageDance`.
- Refresh the Lust boss note in `README.md` so the pacing description stays readable and accurate.
