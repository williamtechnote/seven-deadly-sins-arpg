# Lust Local Cooldowns Design

Keep `魅惑女妖` phase 3 readable after a full attack loop by adding phase-local cooldowns to selected specials instead of rewriting the boss system.

## Approaches

1. Add opt-in phase-local cooldown timers in the existing selector and configure only Lust phase 3.
2. Convert phase attacks to weighted random picks and lower special weights.
3. Keep the selector unchanged and further pad the phase list with more breather attacks.

## Recommendation

Use option 1. It is the smallest change that survives future phase-data edits, preserves the current readable baseline order, and gives us per-attack knobs for follow-up heartbeats.

## This Cycle

- Implement `reverseControl` phase-local cooldown.
- Implement `illusion` phase-local cooldown.
- Leave `mirageDance` as the next active follow-up if pressure still needs another pass.
