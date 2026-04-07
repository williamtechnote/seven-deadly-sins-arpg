# 武备圣坛 Design

## Context

The current event-room roster already covers stamina sustain, dodge timing, attack cadence, and combo routing. The remaining explicit gap in `TODO.md` is weapon-routing: the run layer still does not push the player toward melee-vs-ranged weapon decisions even though weapon switching is already a core loop.

## Problem

Existing shrines change verbs inside a weapon loop, but none of them changes which weapon class the player wants to hold. The next room should:

- reuse existing weapon-type data instead of creating a new subsystem
- keep route identity readable in the live combat HUD
- stay scoped to one heartbeat by touching shared run effects, `game.js`, and regression checks only

## Options

1. Add another generic risk/reward shrine.
Rejected: the repo already has `血契祭坛`, while weapon routing remains completely uncovered.

2. Add a room that buffs specific named weapons.
Rejected: too brittle and less future-proof than routing by existing `melee` / `ranged` categories.

3. Add a shrine that routes the player into melee attack cadence or ranged special cadence.
Recommended: this directly uses the current weapon-type split, surfaces naturally in the existing `普攻 U` / `特攻 O` HUD rows, and changes weapon choice without adding new UI.

## Chosen Direction

Add `武备圣坛` with two routes:

- `压阵修习`: melee weapons gain faster normal-attack cooldowns
- `离弦修习`: ranged weapons gain faster special cooldowns

## Design Notes

- Shared logic owns the new room definition plus two new neutral run-effect keys:
  - `playerMeleeAttackCooldownMultiplier`
  - `playerRangedSpecialCooldownMultiplier`
- Runtime only applies each buff when the currently equipped weapon type matches.
- The combat HUD keeps the routing readable:
  - attack row shows `压阵-18%` on melee weapons and `压阵切近战` when mismatched
  - special row shows `离弦-22%` on ranged weapons and `离弦切远程` when mismatched
- This stays deliberately scoped to routing and readiness readability; it does not add separate hit-confirm payoff FX in the same heartbeat.

## Success Criteria

- `RUN_EVENT_ROOM_POOL` exposes `武备圣坛` with both weapon-routing choices.
- Choosing `压阵修习` only speeds up normal attacks while a melee weapon is equipped.
- Choosing `离弦修习` only speeds up specials while a ranged weapon is equipped.
- Combat HUD labels make the current route readable even before the player switches weapons.
