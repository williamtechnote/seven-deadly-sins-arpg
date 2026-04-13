# Corridor Target Bridge Design

## Goal

Keep the hub-selected boss posture alive through the quiet corridor after a combat-opening first room by showing one compact bridge cue before the first shrine reminder takes over.

## Context

The current early-run ladder in this workspace already covers:

- portal focus: `目标 Boss` + `门前 ...`
- level entry: `目标 色欲 · 稳拍反制`
- first combat wake-up: `首战 稳拍反制`
- first unresolved shrine: `按F效果 · 稳拍反制`

That still leaves one seam on combat-opening seeds: after room 1 is cleared, the wake-up cue is gone and the shrine reminder has not appeared yet. The player can cross a quiet corridor with no lightweight posture bridge.

## Approaches

### 1. Add a persistent Boss posture HUD block

Rejected: too heavy for a short transition gap and directly against the repo's compact reminder ladder.

### 2. Fire a room-1 clear cue on the last enemy death

Rejected: it would compete with drops, payoff bursts, challenge completion feedback, and clear-time noise. It lands too close to combat resolution, not the next decision transition.

### 3. Fire one shared corridor-entry bridge cue

Recommended: it speaks after combat pressure has ended, before shrine proximity begins, and uses the same floating-text channel as the existing early-run cues without creating a new persistent surface.

## Recommendation

Choose approach 3.

Add a shared helper that turns the current boss target into a compact transition-facing cue:

- `过门 稳拍反制`
- `过门 回体扛压`

`LevelScene` should announce that cue once when:

- room 1 has been fully cleared
- the run already had a valid first-combat cue
- the player first enters the room-1 -> room-2 corridor

That keeps the posture alive through the quiet handoff without inventing another panel or stacking another clear-time burst on top of drops.

## Design

- Add one shared helper in `shared/game-core.js` that derives the corridor bridge cue from the normalized boss target.
- Cache the cue in `LevelScene` beside the existing run-start and first-combat cues.
- Track the first corridor bounds in `LevelScene`.
- Add a one-shot `_maybeShowCorridorTargetBridgeCue()` runtime hook that waits for room-1 clear, then fires when the player first enters that corridor.
- Reuse the same floating-text color family as the other early-run posture cues.
- Leave shrine/world-label reminders unchanged; this cue only fills the silent corridor between first combat and first shrine.

## Testing

- Add failing helper coverage for cue generation and silent fallback.
- Add runtime-source assertions proving `LevelScene` imports the helper, caches the cue, tracks the one-shot state, records the first corridor bounds, and triggers the cue only after room-1 clear and corridor entry.
- Extend README/help assertions so the new `过门 ...` bridge stays documented beside the existing portal/run-start/first-combat/shrine ladder.

## Assumption

This heartbeat is running in required non-interactive automation, so the design is self-approved for execution.
