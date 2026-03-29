# Lust Illusion Recovery Return Design

Narrow the next `魅惑女妖` phase-3 pacing pass to `illusion`'s explicit post-despawn recovery window so the player gets a cleaner breather after clones disperse.

## Options

### Option A: Lengthen `illusion` recovery only

Raise the explicit `illusion` recovery constant in `game.js`, then sync `README.md` and regression expectations.

Pros:
- Smallest gameplay change that still addresses the remaining dense handoff after the shared recovery pass.
- Reuses the existing phase order, shared recovery guard, and breather-chain rules without stacking another pacing system on top.
- Keeps the tuning legible in tests because only one recovery window changes.

Cons:
- If phase 3 is still too dense after this, another pass will still be needed.

### Option B: Raise shared recovery again

Increase `sharedAttackRecoveryMs.majorSpecial` one more step.

Pros:
- Centralized, data-driven tuning.

Cons:
- Repeats the last intervention instead of using the remaining single-attack recovery lever the active observation points to.

### Option C: Add still more bridge attacks

Insert more `charmBolt` / `dash` padding between `illusion` and the next major special.

Pros:
- Very visible pacing change.

Cons:
- More intrusive, and the current attack order already carries long directed bridges.

## Decision

Choose Option A. The backlog already exhausted extra bridge padding and a second shared recovery extension. The next maintainable move is to widen the explicit `illusion` recovery window and lock that contract with tests.

## Scope

- Promote a new active TODO item for the `illusion` recovery pass.
- Tighten `scripts/regression-checks.mjs` first so the current tree fails on the new recovery contract.
- Increase the `illusion` recovery window in `game.js`.
- Update `README.md` so the player-facing phase-3 pacing description stays aligned.
- Leave the broader live-observation item in `TODO.md` for any future follow-up.
