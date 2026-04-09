# Encounter Composition Routing Design

## Context

`缓冲战 / 高压战 / 淘金战` currently change room-3 HP, speed, and gold values, but the enemy lineup still mostly feels like the same fight. The methodology docs call out a stronger goal: players should feel a route choice in the next 1-3 rooms through pacing texture, not only hidden math.

## Options

1. Add more room-entry copy explaining what each encounter profile means.
Rejected: better labels help comprehension, but they still leave room 3 fighting the same roster.

2. Add profile-driven spawn delays or wake-up timers.
Viable, but higher runtime risk because it touches enemy AI timing and is harder to reason about from static regression checks.

3. Route room-3 enemy composition through a shared helper.
Recommended: it changes the actual fight silhouette, stays deterministic, and can be covered by shared-helper tests plus a narrow LevelScene hook.

## Chosen Direction

Add a shared roster helper that derives a room-3 lineup from the area enemy pool plus the resolved encounter profile:

- `缓冲战`: choose the two lowest-pressure enemy archetypes
- `高压战`: spawn all three local archetypes
- `淘金战`: choose the two highest-gold enemy archetypes

Keep the existing stat multipliers, so composition and pacing both reinforce the same route identity.

## Design Notes

- Shared logic in `shared/game-core.js` owns the roster selection contract.
- `game.js` consumes the resolved roster when the event room settles and rebuilds room 3 accordingly before the player enters it.
- Regression coverage should prove both the roster helper outputs and the runtime hook that swaps room-3 composition from the chosen encounter profile.

## Success Criteria

- Encounter profiles resolve to distinct room-3 enemy rosters from the same area pool.
- `高压战` produces a visibly denser room than the other two profiles.
- `淘金战` always includes the higher-gold local enemies.
- README explains that encounter routing now changes both room-3 pacing and composition.
