# Lust Collapse Cooldown Design

**Date:** 2026-03-11

## Goal

Turn the remaining `魅惑女妖` phase 3 pacing observation into three concrete backlog items and implement the first two without changing the overall boss-system shape.

## Prioritized Scope

1. Lengthen `mirageDance` finisher reverse-wave collapse time so the post-settle punish resolves less abruptly.
2. Raise Lust phase 3 `reverseControl` / `illusion` / `mirageDance` phase-local cooldowns so the second rotation stays more spaced out after a full loop.
3. Keep one final live-observation item open in case phase 3 still feels dense after the two tuning passes above.

## Approach Options

### Option A: Tune only the two exposed pacing constants

Adjust the reverse-wave collapse duration inside the existing `mirageDance` executor and raise the existing phase-local cooldown values in phase 3 data.

Pros:
- Smallest possible runtime change
- Reuses the existing selector and cooldown plumbing
- Fits the current source-hook regression style

Cons:
- Leaves no extra adaptive logic if future tuning is needed

### Option B: Add new selector rules instead of stronger cooldowns

Introduce another pacing guard in the attack picker and leave the cooldown values mostly unchanged.

Pros:
- More targeted to edge-case rotations

Cons:
- Expands generic selector complexity again
- The active TODO explicitly points at collapse time and cooldown pressure first

### Option C: Tune only `mirageDance`

Slow the reverse-wave collapse without changing cooldowns.

Pros:
- Lowest data risk

Cons:
- Does not address dense second-loop special cadence

## Recommendation

Use Option A. It matches the active TODO, keeps the work localized, and can be locked with narrow regression checks.

## Design

### Reverse-Wave Timing

- Keep the existing three-beat setup, settle delay, locked finisher target, and projectile count.
- Increase only the reverse-wave collapse duration so the finisher still threatens the locked position but spends longer converging there.

### Phase-Local Cooldowns

- Raise phase 3 cooldown values for `reverseControl`, `illusion`, and `mirageDance`.
- Preserve the existing ordering between the three cooldowns so `mirageDance` remains the longest lockout.

## Testing Strategy

- Update regression hooks first so they require:
  - the longer `mirageDance` collapse duration constant
  - the stronger Lust phase 3 phase-local cooldown values
- Run the required CLI regression bundle after implementation.
