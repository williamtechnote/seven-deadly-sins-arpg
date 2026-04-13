# Run-Start Target Cue Design

## Goal

Carry the portal-choice Boss posture into the first second of `LevelScene`, so the player does not lose that framing at the exact scene transition into the run.

## Context

The repo now has a strong hub-side handoff:

- `上轮战报` preserves how the previous route ended
- `选门参考` adds `目标 Boss` plus a compact `门前 ...` posture cue
- event-room recommendations can later reuse target-Boss posture once a shrine decision appears

The remaining blind spot is the gap between those two surfaces. Right after the player commits to a portal, the hub card disappears and the run opens with no shared reminder of what that Boss posture means. That weakens the planning loop the methodology docs are aiming for:

- `arpg-hub-portal-target-framing.md` says portal focus should frame the next planning problem in playable terms
- `arpg-encounter-pacing-and-reward-methodology.md` prioritizes improvements a player can perceive within 30 seconds
- `gameplay-run-variety-principles.md` favors readable verb-level guidance over additional hidden systems

## Options

1. Add a persistent Boss-target HUD block during the whole run.
Rejected: it spends scarce HUD real estate on information that matters most at run start, not on every combat second.

2. Expand the existing area title into a larger multi-line briefing card.
Rejected: it duplicates portal information in a heavier surface and risks crowding room-entry readability.

3. Add one shared one-shot run-start cue derived from the same Boss posture vocabulary used by portal focus.
Recommended: it bridges the scene transition, stays compact, reuses existing wording, and is deterministic enough for regression coverage.

## Chosen Direction

Add a shared helper in `shared/game-core.js` that turns the existing boss-aware target payload into one short cue:

- `目标 傲慢 · 稳线读招`
- `目标 暴怒 · 回体扛压`
- `目标 色欲 · 稳拍反制`

`HubScene` already knows the target label and `bossKey`. `LevelScene` also already knows `bossKey`, so runtime only needs to build the same target payload at run start and show the helper output once near the player spawn. This keeps the wording aligned with `选门参考` without creating a second always-on panel.

## UX Contract

- The cue is one-shot, not persistent HUD.
- The cue should only appear when a shared Boss posture exists.
- Prefer the short sin label (`目标 色欲`) over the full area label to keep the floating text compact.
- Reuse the existing `门前` vocabulary rather than inventing a second naming system.

## Testing Contract

- Shared helper returns the expected short cue for known boss-aware targets and stays silent without a posture cue.
- `LevelScene` builds the boss-aware target payload from `bossKey`.
- `LevelScene` stores and shows the cue only once after entering the run.
- README and help overlay describe that portal posture now survives into run start.

## Assumption

This heartbeat is executing in a required non-interactive automation flow, so the design is treated as self-approved for the cycle.
