# Lust Recovery Spacing Design

Keep `魅惑女妖` phase 3 readable after the longer shared recovery and `mirageDance -> reverseControl` loopback bridge by converting the remaining observation item into two explicit recovery tweaks plus one fallback observation.

## Options

### Option A: Extend `reverseControl` and `illusion` recovery windows again

Increase the explicit post-effect recovery windows in the two existing special executors so both attacks leave a slightly longer punish gap before the next selector pick.

Pros:
- Directly addresses the remaining live pacing observation
- Reuses the executor-level recovery pattern already in place
- Easy to lock with source-hook regressions

Cons:
- Slightly lengthens total phase-3 downtime

### Option B: Add another directed light-pressure bridge

Leave executor timings alone and add one more `charmBolt` / `dash` bridge segment somewhere in the major-special loop.

Pros:
- Data-only pacing change

Cons:
- Changes rotation shape again before exhausting simpler recovery tuning
- Harder to predict than explicit post-attack recovery

### Option C: Stretch shared recovery once more

Increase the shared guard that delays all three major specials.

Pros:
- Centralized selector change

Cons:
- Broadens every major-special gap equally instead of targeting the two moves still feeling dense
- Risks over-delaying `mirageDance`, which already received the latest loopback bridge

## Recommendation

Choose Option A. It is the narrowest change that still acts on the two special endings most likely to compress the late-phase cadence after the latest selector-level tuning. Leave a single follow-up TODO for an extra bridge only if these two executor-level recovery extensions still do not open enough space.

## Approved Design

1. Increase the explicit `reverseControl` recovery window after projectile collapse.
2. Increase the explicit `illusion` recovery window after clone despawn and alpha restore.
3. Update README, TODO, and regressions to describe the new contract and leave one remaining phase-3 observation item for any further bridge work.
