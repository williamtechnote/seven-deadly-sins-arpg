# Lust Mirage Cooldown Guards Design

Keep `魅惑女妖` phase 3 readable after the first full special cycle by finishing the phase-local cooldown pass and then locking the three-special contract in docs/tests.

## Approaches

1. Extend the existing phase-local cooldown metadata to `mirageDance` and tighten the regression/docs wording around the full trio.
2. Reorder the phase 3 attack list again to insert more `dash` / `charmBolt` fillers after `mirageDance`.
3. Retune `mirageDance` itself with slower cadence or a longer finisher settle.

## Recommendation

Use option 1. The selector already supports opt-in per-attack cooldowns, so finishing that system is the smallest change that preserves the current phase 3 sequence and survives future data edits.

## This Cycle

- Implement `mirageDance` phase-local cooldown metadata.
- Update regression coverage and README wording so the full `reverseControl` / `illusion` / `mirageDance` cooldown contract is explicit.
- Leave any post-`mirageDance` extra breather retune as the next observation item if live pacing still feels dense.
