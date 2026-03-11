# Lust Special Breathers Design

Turn the remaining `魅惑女妖` phase 3 pacing observation into three concrete backlog items, then implement the first two without changing the boss runtime shape.

## Options

### Option A: Add phase-data breather guards after `reverseControl` and `illusion`

Extend the existing `postAttackBreatherGuards` metadata for Lust phase 3 so both specials block an immediate follow-up into the same major-special set when a lighter attack is available.

Pros:
- Reuses the selector hook that already exists for `mirageDance`
- Keeps the change localized to Lust phase 3 data
- Easy to lock with source-hook regressions and README wording

Cons:
- Adds one more tuning rule to the phase metadata

### Option B: Add more recovery time inside the attack executors

Increase recovery windows for `reverseControl` and `illusion` again instead of adjusting selection rules.

Pros:
- No selector/data change

Cons:
- The previous cycle already spent this lever
- Lengthens attack uptime instead of spacing the next pick

### Option C: Raise `charmBolt` / `dash` weighting again

Bias phase 3 even more toward lighter attacks and rely on odds to spread the specials.

Pros:
- Pure data tweak

Cons:
- Less deterministic than a direct breather guard
- Risks flattening the late-phase identity

## Recommendation

Choose Option A. The selector plumbing already supports this exact pattern, so the clean next step is to add `reverseControl` and `illusion` metadata, lock it with failing regressions first, and leave one final live-observation item open only if the phase still feels too dense.

## Approved Design

1. Add a `reverseControl` post-attack breather guard that blocks `reverseControl`, `illusion`, and `mirageDance` on the next pick when `charmBolt` or `dash` is available.
2. Add the same guard for `illusion`.
3. Rewrite the active backlog into three ordered items, implement the first two, and leave a final observation item for any remaining phase-3 density follow-up.
