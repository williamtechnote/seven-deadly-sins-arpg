# Lust Recovery Guard Design

Keep `魅惑女妖` phase 3 readable after the longer `mirageDance -> reverseControl` loopback bridge and `mirageDance` recovery pass by converting the latest observation into two explicit executor recoveries plus one fallback observation.

## Options

### Option A: Extend `reverseControl` and `illusion` recovery again

Increase the explicit post-effect recovery windows in the two special executors that still compress the late-phase cadence after the latest loopback tuning.

Pros:
- Directly matches the active observation
- Reuses the existing executor-level pacing pattern
- Easy to lock with source-hook regressions

Cons:
- Slightly increases late-phase downtime

### Option B: Raise the breather chain immediately

Move the post-major breather guard from five lighter attacks to six before another major special can return.

Pros:
- Data-driven selector change
- Preserves executor timings

Cons:
- Broadens every major-special return instead of targeting the two endings still feeling dense
- Larger rotation-shape shift than necessary right now

### Option C: Add another directed bridge segment

Insert even more `charmBolt` / `dash` padding between phase-3 major specials.

Pros:
- Data-only

Cons:
- Repeats the last pass before exhausting the simpler executor knobs

## Recommendation

Choose Option A first. It is the narrowest response to the current live-pacing note because the last pass already lengthened the loopback bridge and `mirageDance` recovery. Leave a single follow-up observation for a six-breather guard or another bridge only if these two recovery extensions still are not enough.

## Approved Design

1. Increase `reverseControl` post-collapse recovery again.
2. Increase `illusion` post-despawn recovery again.
3. Update README, TODO, and regressions to document the new spacing contract and leave one fallback observation item active.
