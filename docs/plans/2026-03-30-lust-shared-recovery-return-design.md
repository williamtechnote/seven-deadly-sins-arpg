# Lust Shared Recovery Return Design

`魅惑女妖` phase 3 has already widened the `illusion -> mirageDance` and `mirageDance -> reverseControl` light-pressure bridges. The remaining active TODO asks whether the next pass should return to shared `majorSpecial` recovery or stretch `mirageDance` recovery again.

## Approaches

1. Extend `mirageDance` recovery again.
This is precise, but it only delays one handoff after `mirageDance` and overlaps with the last recovery-focused pass.

2. Extend shared `majorSpecial` recovery again.
This broadens the breathing room after any of the three major specials, reuses the existing phase data hook, and matches the active observation's first recommended fallback.

3. Add another directed bridge segment.
This would work, but the last pass already targeted the loopback bridge directly, so repeating it now is less balanced than widening the shared guard.

## Recommendation

Choose approach 2. Raise Lust phase 3's shared `majorSpecial` recovery window so `reverseControl`, `illusion`, and `mirageDance` all yield to `charmBolt` / `dash` for a little longer after the newly extended loopback bridge.

## Scope

- Update the active TODO from observation to implementation, then promote the next observation after delivery.
- Lock the new shared-recovery value and README wording in `scripts/regression-checks.mjs`.
- Raise the phase-3 shared `majorSpecial` recovery in `data.js`.
- Refresh the README boss-pacing note so it stays readable and accurate.
