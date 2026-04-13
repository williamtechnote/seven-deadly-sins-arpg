# Boss Opening Route Echo Design

## Context

`缓冲路线 / 高压路线 / 淘金路线` already survive shrine choice, settlement, room-3 entry, first payoff beat, clear recap, and the Boss-door handoff label. The remaining gap is the first beat of the boss fight itself: once the player crosses the door, the routed segment goes silent right before the next major skill check begins.

The repo's methodology docs point to a better continuation:

- short-run choices should stay legible into the next major combat decision
- delayed consequences still need one clear signal at the next gate
- high-ROI reward work should reuse existing surfaces and shared helpers instead of inventing a new subsystem

## Options

1. Add more Boss-door copy only.
Rejected: the handoff is already covered. It improves recap, not the boss opener itself.

2. Route the boss's actual first attack pattern.
Rejected for this heartbeat: interesting long-term, but too risky for a narrow deterministic cycle because it would touch boss behavior balance instead of just run-arc readability.

3. Add one shared boss-opening echo that fires once when the boss fight begins.
Recommended: it extends the existing six-beat route contract into the next active combat beat, stays deterministic, and can be covered with shared-helper plus scene-glue regression checks.

## Chosen Direction

Add a shared helper that converts the routed encounter profile into a compact boss-opening echo:

- `缓冲路线 · 稳线开局`
- `高压路线 · 抢势开局`
- `淘金路线 · 带赏开局`

`LevelScene` should pass the active routed encounter profile into `BossScene` when the player enters the cleared Boss door. `BossScene` should then show the shared opener line once near the start of the fight as a lightweight floating cue. The cue should be route-level only, not recommendation-reason-specific, so it reads as the segment handoff rather than another room-3 tactic note.

## Design Notes

- Keep the mapping in `shared/game-core.js` beside the other encounter recap helpers.
- Reuse the existing route labels so the player does not learn new vocabulary at the final handoff.
- Show the opener cue once and only once; it should reinforce the start of the boss fight, not become persistent HUD.
- Leave boss behavior unchanged in this cycle. The gain here is run-arc readability, not balance retuning.

## Success Criteria

- A cleared routed run now carries one final shared cue into the boss opener.
- The cue is absent when there is no routed encounter profile.
- `LevelScene` passes the routed profile into `BossScene` through scene data instead of ad-hoc globals.
- Regression coverage locks the helper output and the `LevelScene`/`BossScene` handoff.
