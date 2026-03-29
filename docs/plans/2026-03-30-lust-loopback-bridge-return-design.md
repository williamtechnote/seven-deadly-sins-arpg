# Lust Loopback Bridge Return Design

## Context

`魅惑女妖` phase 3 already spaces `reverseControl` / `illusion` / `mirageDance` with phase-local cooldowns, shared major-special recovery, explicit post-special recovery windows, and directed `charmBolt` / `dash` bridges. The remaining active observation is whether the longer `illusion` recovery pass still leaves the `mirageDance -> reverseControl` loopback too eager in live pacing.

## Options

1. Extend the `mirageDance -> reverseControl` loopback bridge again.
   This is the most targeted adjustment. It only stretches the return path after `mirageDance`, aligns with the active TODO thread, and can be locked with the existing phase-3 attack-order regressions.
2. Extend shared `majorSpecial` recovery again.
   This affects all three major specials at once. It is broader than the current observation and risks over-slowing unrelated phase-3 paths.
3. Extend `mirageDance` recovery again.
   This keeps the pressure drop attached to the special itself, but the repo already added multiple recovery passes here, so another loopback bridge extension is the cleaner next move.

## Decision

Use option 1. Add one more `dash` / `charmBolt` pair to the `mirageDance -> reverseControl` loopback bridge, then update README wording and the heartbeat TODO chain to reflect the new pacing pass.

## Testing

- Update the existing Lust phase-3 attack-order regression to require the longer loopback slice.
- Update the focused loopback-bridge regression to expect 22 attacks after `mirageDance`.
- Update the README regex assertion so the doc must mention the third extra `dash` / `charmBolt` pair.
