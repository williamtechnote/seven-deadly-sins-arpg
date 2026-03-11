# Lust Phase 3 Breather Chain Design

Turn the remaining `魅惑女妖` phase 3 pacing observation into three concrete backlog items, then implement the first two that most directly reduce back-to-back major-special pressure.

## Options

### Option A: Lengthen the shared major-special recovery guard

Increase the existing `sharedAttackRecoveryMs.majorSpecial` window for Lust phase 3 so `reverseControl`, `illusion`, and `mirageDance` stay gated for longer after any one of them finishes.

Pros:
- Reuses the existing phase-data contract
- Deterministic and low-risk
- Easy to lock with data and README regressions

Cons:
- Only affects the first repick window

### Option B: Require two lighter attacks before the next major special

Add a new phase-level selector rule so after any Lust phase-3 major special finishes, the boss must spend two picks on `charmBolt` or `dash` before another major special becomes eligible again.

Pros:
- Deterministic spacing instead of relying on weight alone
- Keeps the phase identity while adding a visible breather chain

Cons:
- Needs one new selector state path

### Option C: Raise `charmBolt` / `dash` weighting again

Add still more light-attack copies to the phase-3 pool and let probability create the spacing.

Pros:
- Pure data tweak

Cons:
- Less reliable than A/B
- Risks flattening the late-phase cadence

## Recommendation

Implement Options A and B first. They directly target the remaining density report with deterministic phase-scoped hooks, while leaving weight inflation as the final fallback only if live pacing is still too dense afterward.

## Approved Design

1. Raise Lust phase-3 `majorSpecial` shared recovery from the current baseline to a longer guard.
2. Add a phase-3 “double breather” contract: after `reverseControl`, `illusion`, or `mirageDance`, two `charmBolt` / `dash` picks must resolve before another major special is eligible.
3. Rewrite TODO into three ordered items, implement the first two, and leave one final observation item for any remaining density follow-up.
