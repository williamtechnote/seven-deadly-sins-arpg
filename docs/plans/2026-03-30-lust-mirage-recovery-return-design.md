# Lust Mirage Recovery Return Design

`魅惑女妖` phase 3 already widened the directed bridges around `illusion -> mirageDance` and `mirageDance -> reverseControl`, then stretched the shared `majorSpecial` recovery guard again. The previous active TODO explicitly said the next fallback should return to `mirageDance` recovery if that broader guard still left live pacing too eager.

## Approaches

1. Extend `mirageDance` recovery again.
This is the smallest change, directly delays the `mirageDance -> reverseControl` handoff, and matches the current TODO's stated fallback.

2. Extend `reverseControl` recovery again.
This would slow the following `illusion` handoff instead of the loopback, so it is less aligned with the current observation.

3. Add another `mirageDance -> reverseControl` directed bridge segment.
This would work, but the last follow-up already targeted that bridge directly, so repeating it now would be more churn than value.

## Recommendation

Choose approach 1. Raise the explicit `mirageDance` post-collapse recovery window so the next loop back to `reverseControl` yields to the existing light-pressure bridge for a little longer before the next major special can re-enter.

## Scope

- Promote a concrete `mirageDance` recovery task into `TODO.md`.
- Lock the new `mirageDance` recovery value and README wording in `scripts/regression-checks.mjs`.
- Raise the `mirageDance` finisher recovery window in `game.js`.
- Refresh the Lust pacing note in `README.md` and promote the next observation after delivery.
