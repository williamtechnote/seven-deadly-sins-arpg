# Encounter Pacing Routing Design

## Context

`缓冲战 / 高压战 / 淘金战` already change room 3's roster, formation, and reward tuning. That improves forecast, but the first seconds of the fight still often start with the same "all enemies are live now" cadence. The methodology docs call out a better target: route choices should change the next combat decision within 30 seconds, and ideally within the first few beats of room entry.

## Options

1. Add more encounter-preview copy.
Rejected: it explains the route better, but it does not change the room-opening loop.

2. Add profile-specific reward drops only.
Rejected: extra rewards help payoff, but they still leave room entry pacing too similar across profiles.

3. Add deterministic profile-driven engagement timing.
Recommended: it changes how the room opens without adding a new subsystem, stays deterministic enough for regression coverage, and directly reinforces the existing formation work.

## Chosen Direction

Extend the shared encounter-slot contract so each room-3 enemy can carry an engage delay:

- `缓冲战`: keep the lower-pressure duo and deeper spacing, but stagger their aggro so the room opens with a visible breather beat instead of an immediate double collapse.
- `高压战`: keep the compressed three-enemy wedge and make all enemies engage immediately, preserving the faster multi-angle pressure profile.
- `淘金战`: keep the front/back bounty stack, but delay the deeper target slightly so the player reads a front stabilizer first and then chooses whether to chase the reward enemy.

## Design Notes

- Shared logic in `shared/game-core.js` should remain the source of truth for the profile-specific timing contract.
- `game.js` should only consume that timing by spawning room-3 enemies with a lightweight "engage at" timestamp and letting `Enemy.update()` hold them in a non-aggressive idle state until that time.
- The implementation should not add hidden randomness. Delays must be deterministic per profile so the route stays testable and learnable.
- The room should still become fully active on its own; this is pacing, not stealth or encounter skipping.

## Success Criteria

- `缓冲战` opens with a readable stagger instead of two immediate live threats.
- `高压战` still becomes dangerous immediately on entry.
- `淘金战` preserves a clear chase-vs-stabilize decision by delaying the deeper bounty target.
- Regression coverage proves both the shared timing helper output and the runtime hooks that defer enemy aggression.
- README stays concise while documenting that encounter routing now changes room-opening timing in addition to roster and formation.
