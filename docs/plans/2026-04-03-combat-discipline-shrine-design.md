# 战技圣坛 Design

## Context

Recent heartbeat work clustered around Lust phase-3 readability and reporting. The current repo already has a solid event-room framework, but the shipped blessing rooms still lean toward stamina regen and special cooldown value. There is room for a more tactile run-shaping choice that changes how often the player uses their core verbs.

## Problem

The run layer needs a fresh gameplay-facing direction that:

- does not reopen the fragile phase-3 report surface
- reuses existing HUD and event-room plumbing
- creates a noticeable combat identity inside a single run

## Options

1. Add another Lust pacing follow-up.
Rejected: high regression risk, low freshness.

2. Add a new consumable trade room.
Rejected: useful, but still feels economy-heavy rather than changing moment-to-moment combat.

3. Add a new blessing room that changes basic-attack cadence or dodge economy.
Recommended: leverages existing event-room systems while producing immediately readable combat differences.

## Chosen Direction

Add `战技圣坛` as a sixth event-room prototype. It offers two blessings:

- `连斩修习`: lower basic-attack cooldown for a more aggressive rhythm
- `游步修习`: lower dodge cooldown and dodge stamina cost for a more evasive rhythm

## Design Notes

- The new room stays within the existing `blessing` type so current HUD labels and settlement copy continue to work.
- The new effects extend `DEFAULT_RUN_EFFECTS` with basic-attack and dodge-economy multipliers.
- `shared/game-core.js` owns the event definition, summary text, and effect composition.
- `game.js` applies the effects when the player attacks, dodges, and when the action HUD computes its readiness labels.
- Regression coverage should lock the room definition, effect summaries, and runtime source hooks.

## Success Criteria

- A run can roll `战技圣坛` and present both routes in summaries/UI.
- Settling `连斩修习` changes the player's normal attack cadence.
- Settling `游步修习` changes dodge cooldown and dodge stamina usage.
- README/TODO/PROGRESS document the new room cleanly.
