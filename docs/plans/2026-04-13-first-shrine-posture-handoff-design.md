# First Shrine Posture Handoff Design

## Goal

Carry the hub-selected boss posture past the one-shot run-start cue and into the first unresolved shrine approach, so the player's first event-room decision still remembers what the next boss wants.

## Context

The repo now has a strong hub-to-run handoff:

- portal focus shows `目标 Boss` plus `门前 ...`
- run start shows a one-shot `目标 色欲 · 稳拍反制` cue

That cue is helpful, but it fades before the first shrine interaction. The open TODO already points at the next evaluation target: if run-start posture works, the clean follow-up is the first shrine approach, not a new permanent Boss HUD block.

## Approaches

### 1. Add a persistent Boss posture HUD block

Rejected: too heavy for a signal that matters most only before the first route decision.

### 2. Add a second room-title burst near the first shrine

Rejected: duplicates the run-start floating text pattern and still does not strengthen the actual interaction surface.

### 3. Extend the unresolved shrine prompt/world label with one compact target reminder

Recommended: it reuses an existing decision surface, keeps the copy compact, and only speaks when the player is about to make the first meaningful route choice.

## Recommendation

Choose approach 3.

Use a shared helper that derives compact shrine-facing target posture text from the same boss target input already used by the portal and run-start helpers:

- prompt: `按F效果 · 稳拍反制`
- world label: `祈愿圣坛 · 目标 稳拍反制`

Only unresolved shrine surfaces should use it. Resolved labels stay as they are today.

## Design

- Add one shared helper in `shared/game-core.js` that resolves two strings from the boss target:
  - `promptCue`
  - `worldLabelCue`
- Extend `buildRunEventRoomPromptLabel()` with an optional target argument.
- Extend `buildRunEventRoomWorldLabel()` so unresolved shrines can append the target reminder.
- Thread the current boss target from `LevelScene` into the existing prompt/world-label refresh paths.
- Keep the copy short and boss-cue-only; do not repeat the full boss area name at the shrine.

## Testing

- Add failing helper coverage for cue generation and fallback silence.
- Extend prompt/world-label regression checks with unresolved-shrine target-handoff assertions.
- Add one runtime source assertion proving `LevelScene` passes the current boss target into both helpers.

## Assumption

This heartbeat is running in non-interactive automation, so the design is self-approved for execution.
