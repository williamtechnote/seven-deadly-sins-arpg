# Lust Shared Recovery Recheck Design

## Context

`TODO.md` currently leaves Lust phase 3 on a live-observation item after the latest `reverseControl` recovery extension. The remaining pacing risk is not the `reverseControl -> illusion` handoff itself anymore, but the overall time before any of the three major specials can re-enter the loop.

## Options

### Option A: Raise shared `majorSpecial` recovery again

Increase `sharedAttackRecoveryMs.majorSpecial` for Lust phase 3 and sync the regression/README contract.

Why this is the best next move:
- It directly targets the still-dense special-stack spacing named by the active TODO.
- It stays data-driven and avoids touching the boss executor again.
- It leaves `illusion` recovery available as the next follow-up only if this still is not enough.

### Option B: Raise `illusion` recovery again

Lengthen the explicit `illusion` recovery window instead of the shared guard.

Trade-off:
- Also likely helps, but it only affects one branch and is less aligned with the broader “specials are still too close together” observation.

### Option C: Add still more bridge attacks

Insert another `charmBolt` / `dash` segment into the fixed phase-3 order.

Trade-off:
- More invasive than needed after the recent bridge pass and duplicates the last intervention pattern.

## Decision

Choose Option A. Promote a new active TODO for a shared `majorSpecial` recovery extension, implement that one item, and leave a single follow-up observation about whether `illusion` recovery still needs another pass.
