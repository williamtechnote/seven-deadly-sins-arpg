# Lust Special Recovery Design

Keep `魅惑女妖` phase 3 readable after the recent `mirageDance` pacing pass by turning the last live-observation item into three concrete recovery-focused follow-ups.

## Options

### Option A: Add explicit recovery windows to `reverseControl` and `illusion`

Extend the existing special executors so each move keeps the boss in attack state for a short post-effect recovery after the damaging portion ends.

Pros:
- Stays local to Lust specials already under tuning
- Matches the recovery treatment already used for `mirageDance`
- Easy to lock with source-hook regressions

Cons:
- Slightly lengthens total attack uptime

### Option B: Add more selector-only breather guards

Leave the special executors alone and add new `postAttackBreatherGuards` entries so the next pick cannot immediately chain into another major special.

Pros:
- Minimal runtime change inside the attack executor

Cons:
- Does not create a visible punish window after the move itself
- Stacks another selector rule onto already layered pacing logic

### Option C: Retune phase-3 weights again

Increase `charmBolt` / `dash` presence even further and rely on rotation odds to create more breathing room.

Pros:
- Data-only change

Cons:
- Less deterministic than explicit recovery windows
- Risks eroding Lust's late-phase identity

## Recommendation

Choose Option A now. It directly addresses the remaining observation item, mirrors the successful `mirageDance` recovery treatment, and keeps the change set narrow. Keep one selector-level breather fallback as the next active observation item only if live pacing is still too dense after both recovery windows land.

## Approved Design

1. Add a short explicit recovery window after `reverseControl` finishes its projectile collapse.
2. Add a short explicit recovery window after `illusion` finishes its clone sequence and reveals the real boss.
3. Rewrite the single active TODO into three ordered items, implement the first two, and leave a final observation item for any extra `reverseControl` / `illusion` breather guard work.
