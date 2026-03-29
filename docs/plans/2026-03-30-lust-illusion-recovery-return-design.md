# Lust Illusion Recovery Return Design

Convert the remaining `魅惑女妖` phase-3 pacing observation into one concrete recovery follow-up plus one new observation, then implement only the recovery step.

## Options

### Option A: Return to `illusion` recovery

Increase the explicit `illusion` post-despawn recovery window one more notch and keep the rest of the attack order unchanged.

Pros:
- Smallest possible pacing change.
- Fits the active TODO wording directly.
- Reuses the existing executor hook and regression structure.

Cons:
- Does not add any new bridge padding if live pacing still feels dense afterward.

### Option B: Extend the `mirageDance -> reverseControl` bridge again

Insert another `dash` / `charmBolt` pair into the loopback bridge.

Pros:
- Entirely data-driven.

Cons:
- Reopens the larger attack-order sequence after it was just extended.

### Option C: Raise shared recovery again

Lengthen the shared `majorSpecial` recovery window once more.

Pros:
- Broadly slows all major-special returns.

Cons:
- Repeats a tuning lever that already landed immediately before the latest `reverseControl` follow-up.

## Decision

Choose Option A. The active observation already narrowed the next decision to loopback bridge versus `illusion` recovery. Returning to `illusion` recovery is the smaller intervention, keeps the recent bridge ordering stable, and matches the established 120ms recovery-step cadence.

## Scope

- Split `TODO.md` into concrete item `八十二` plus follow-up observation `八十三`.
- Raise the regression expectation for the `illusion` recovery constant and the README pacing sentence.
- Update the `illusion` recovery constant in `game.js`.
- Sync `README.md` with the new pacing contract.
