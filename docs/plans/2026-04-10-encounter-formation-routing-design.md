# Encounter Formation Routing Design

## Context

`缓冲战 / 高压战 / 淘金战` already rebuild room 3 around different enemy rosters, but all three profiles still spawn with roughly the same lane spacing. That means the player can now read "who is in the room" yet still enters the room with almost the same first-step decision.

The methodology docs point to a stronger outcome: shrine choices should change the next 1-3 rooms in a felt way, and the player should perceive that shift inside the first few seconds of combat.

## Options

1. Compress the encounter preview copy even further.
Rejected: better copy helps forecasting, but it still leaves the room-opening movement problem unchanged.

2. Add profile-specific wake-up delays or AI activation gates.
Viable, but higher runtime risk because it introduces hidden timing variance that is harder to regression-lock.

3. Route room-3 spawn formation through a shared helper.
Recommended: it changes the opening combat geometry immediately, stays deterministic, and can be covered with shared-helper assertions plus a narrow `LevelScene` hook.

## Chosen Direction

Add a shared formation helper that maps the resolved encounter profile to room-3 spawn slots:

- `缓冲战`: keep the lower-pressure duo, but place them deeper and wider so the room opens with more approach time.
- `高压战`: keep the full three-enemy roster and compress it toward the entrance so the player meets pressure earlier and from multiple angles.
- `淘金战`: keep the higher-gold duo, but stagger them into a front/back bounty stack so the player must choose between stabilizing first or chasing the deeper reward target.

The roster helper remains the source of truth for "who spawns." The new formation helper becomes the source of truth for "where they open."

## Design Notes

- Shared logic in `shared/game-core.js` should own the formation contract so the routing stays deterministic and portable.
- `game.js` should consume the helper when rebuilding room 3, instead of hard-coding a single lane formula for every profile.
- Regression coverage should lock both the helper output and the `LevelScene` source hook that reads profile-driven formation slots.

## Success Criteria

- Encounter profiles produce different room-3 opening geometries from the same enemy roster.
- `高压战` visibly starts closer to the entrance than `缓冲战`.
- `淘金战` visibly staggers its targets into different depth bands instead of using a flat pair layout.
- README explains that route-driven encounters now change both enemy lineup and room-opening formation.
