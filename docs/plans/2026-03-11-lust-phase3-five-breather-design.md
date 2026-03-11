# Lust Phase 3 Five-Breather Design

Keep the single active `魅惑女妖` phase-3 observation moving by splitting it into three concrete follow-up items and implementing the first two with the narrowest possible data-only tuning.

## Options

### Option 1: Raise the breather chain and light-pressure bias

Increase the existing `postMajorBreatherChain.requiredCount` from four to five, then extend the phase-3 attack list with one more `charmBolt` / `dash` handoff before the next `reverseControl` loop.

Pros:
- Reuses the existing selector hooks.
- Keeps the change isolated to Lust phase-3 data and docs.
- Directly addresses the current TODO wording.

Cons:
- Further lengthens the light-pressure portion of the loop.

### Option 2: Raise shared recovery again

Only increase `sharedAttackRecoveryMs.majorSpecial`.

Pros:
- Minimal data change.

Cons:
- Repeats the last pass instead of trying the next backlog branch.
- Less visible if the phase already feels acceptable outside the selector timing.

### Option 3: Lengthen individual recovery windows again

Add more recovery to `reverseControl` / `illusion`.

Pros:
- Preserves the current attack order.

Cons:
- Duplicates the most recent runtime tuning instead of progressing the backlog.

## Decision

Use option 1. The repo already has stable hooks for the breather chain and phase-3 attack ordering, so the next heartbeat should stay data-driven: split the TODO into `十八-一 / 十八-二 / 十八-三`, implement `十八-一` by raising the breather chain to five, implement `十八-二` by increasing the light-pressure weighting in the phase-3 attack list, and leave `十八-三` as the next live observation.

## Scope

- Update `TODO.md` active ordering.
- Lock the new contracts in `scripts/regression-checks.mjs` first.
- Update Lust phase-3 metadata in `data.js`.
- Sync the player-facing description in `README.md`.
