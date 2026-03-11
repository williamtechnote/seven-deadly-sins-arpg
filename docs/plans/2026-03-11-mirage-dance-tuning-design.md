# Mirage Dance Tuning Design

**Date:** 2026-03-11

## Goal

Turn the single `魅影连舞` follow-up into heartbeat-sized tuning tasks that improve phase 3 readability without rebuilding the boss system.

## Prioritized Scope

1. Widen `魅影连舞` cadence spacing so the three-beat chain reads as setup, pressure, then finisher.
2. Change the finisher to lock onto the player's position at finisher start instead of continuously homing.
3. Keep a later follow-up open for phase-3 attack sequencing if `mirageDance`, `reverseControl`, and `illusion` still chain too densely.

## Approach Options

### Option A: Tune only `mirageDance` internals

Adjust beat timings, hit windows, and finisher targeting inside the existing special-attack branch.

Pros:
- Lowest risk to the broader boss loop
- Fits current regression style
- Solves the fairness issue at the source

Cons:
- Does not yet address phase-level sequencing between multiple phase-3 attacks

### Option B: Add boss-level pacing rules for all phase-3 specials

Introduce phase-level cooldown/spacing rules so major specials cannot chain too tightly.

Pros:
- Stronger systemic control

Cons:
- Larger change than this heartbeat needs
- Harder to validate with the current source-hook regression suite

### Option C: Only add regression guards

Keep behavior unchanged and just encode today's contract in tests.

Pros:
- Minimal code churn

Cons:
- Fails the TODO's tuning intent

## Recommendation

Use Option A now, then leave Option B as the explicit follow-up if live feel still needs more breathing room.

## Design

### Cadence Tuning

- Replace the fixed 260 ms repeated beat gap with an explicit beat-delay ladder.
- Add a short post-beat settle before the finisher so the player can read the last teleport as a cue rather than an immediate punish.

### Finisher Fairness

- When the finisher starts, snapshot the player's current position.
- Have each reverse-wave projectile collapse toward that locked point rather than the player's current location.
- Keep the reverse-control punish on hit, but make the dodge ask about reading the cue instead of fighting continuous homing.

## Testing Strategy

- Add failing regression checks first for:
  - explicit cadence constants / settle delay hooks
  - finisher target-lock hook
- Then implement the minimal code to satisfy those guards and rerun the full required check bundle.
