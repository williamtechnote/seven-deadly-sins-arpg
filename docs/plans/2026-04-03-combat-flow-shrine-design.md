# 战势圣坛 Design

## Context

Recent heartbeat work already moved event rooms toward verb-level combat identity with `战技圣坛`. The repo docs also now explicitly prefer run-only rewards that change a repeated combat verb instead of only adding flat output. The next follow-up should stay on that lane and avoid reopening the regex-locked phase-3 report surface.

## Problem

The current event-room blessing set has cadence, dodge economy, stamina regen, and special cooldown covered, but it still lacks a route that rewards direct hit confirmation and another route that converts evasive timing into a short burst window.

## Options

1. Add a third route to `战技圣坛`.
Rejected: the repo currently treats event rooms as two-choice forks, so a third branch would either bloat one room or force extra UI work.

2. Return to another phase-3 readability tweak.
Rejected: low freshness, high regression risk, and explicitly deprioritized by the current docs/TODO.

3. Add a second combat-facing blessing room with two new verbs.
Recommended: keeps the two-choice event-room structure intact while extending run identity into hit-confirm stamina flow and dodge-to-special conversion.

## Chosen Direction

Add `战势圣坛` as a new blessing room with two routes:

- `回息修习`: normal-attack hits restore a small fixed amount of stamina
- `借势修习`: completing a dodge arms a short window where the next special attack deals extra damage

## Design Notes

- Shared logic owns the new run-effect contract, room definition, and compact route copy.
- The run-effect combiner must support additive values for fixed stamina gain and timed windows instead of assuming every effect is multiplicative.
- Runtime hooks stay local to existing combat loops:
  - grant stamina on successful non-special hit confirmation
  - arm the post-dodge empower window when a dodge completes
  - consume the empower on the next special attack
- The action HUD should expose the temporary special state with a short `借势` label so the buff is readable without opening extra UI.

## Success Criteria

- A run can roll `战势圣坛` and present both route summaries cleanly.
- `回息修习` restores stamina on landed normal attacks against enemies and bosses.
- `借势修习` grants a short post-dodge special-damage window and the HUD surfaces that temporary state.
- Regression checks lock the shared contract, runtime source hooks, and HUD labeling.
