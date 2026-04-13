# First-Combat Goal Refresh Design

## Goal

Keep the hub-selected boss posture alive through combat-opening seeds by showing one compact reminder when the first room actually wakes up.

## Context

The current early-run ladder on `github/main` already covers:

- portal focus: compact boss posture framing
- level entry: `目标 色欲 · 稳拍反制`
- first unresolved shrine: `按F效果 · 稳拍反制`

That still leaves one seam on combat-opening seeds: the player can cross from run start into the first real pressure beat before any shrine reminder appears. The opening posture briefly exists, then goes silent right before it is most actionable.

## Approaches

### 1. Add a persistent Boss posture HUD block

Rejected: too heavy for a gap that only matters before the first route choice and directly against the repo's compact reminder ladder.

### 2. Push the shrine reminder earlier

Rejected: shrine surfaces do not exist yet on combat-opening seeds, so this does not solve the first wake-up gap.

### 3. Fire one shared first-combat wake-up cue

Recommended: it uses the same floating-text channel as the run-start cue, speaks exactly when the first pressure beat begins, and stays silent once the handoff is complete.

## Recommendation

Choose approach 3.

Add a shared helper that turns the current boss target into a shorter combat-facing cue:

- `首战 稳拍反制`
- `首战 回体扛压`

`LevelScene` should announce that cue once when a room-1 enemy first flips from idle/patrol into active combat. That keeps the current posture alive until the first real skill check without inventing a new persistent surface.

## Testing

- Add failing helper coverage for cue generation and silent fallback.
- Add runtime-source assertions proving `LevelScene` imports the helper, caches the cue, tracks the one-shot state, and triggers it from room-1 combat wake-up.
- Sync README/help assertions so the early-run ladder documents run-start cue, first-combat cue, and first-shrine handoff together.

## Assumption

This heartbeat is running in the required non-interactive workflow, so the design is treated as approved once recorded.
