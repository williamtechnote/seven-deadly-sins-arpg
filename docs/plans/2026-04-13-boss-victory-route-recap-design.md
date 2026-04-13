# Boss Victory Route Recap Design

## Goal

Carry the routed shrine/event-room segment through Boss victory settlement so the short run arc closes with one last shared recap instead of going silent after the opener.

## Context

The current route contract already covers:

- choice preview
- resolve receipt
- room-3 entry
- first payoff beat
- clear recap
- Boss-door recap
- Boss-opening echo

That means the segment now survives all the way into the boss fight, but not out of it. Once the boss dies, the victory stack only reports generic rewards like gold, seals, and weapon unlocks. The player loses the last answer to "what kind of run segment did that earlier route create?"

The repo methodology points to a narrow, high-ROI fix:

- run-shaping decisions should stay legible across a short segment, not just one room
- reward clarity is strongest when the player can still read the consequence during settlement
- shared helper contracts are preferable to scene-local copy so README, runtime, and regression checks stay aligned

## Options

1. Expand the existing Boss victory reward lines with more generic prose.
Rejected: easy to drift, hard to keep systemic, and likely to bloat the victory stack without preserving route identity.

2. Route the Boss defeat dialog through recommendation-specific payoff text.
Rejected for this heartbeat: too granular and more likely to overfit individual shrine reasons instead of closing the shared segment.

3. Add one shared Boss-victory route recap line derived from the routed encounter profile.
Recommended: it closes the segment with one deterministic summary, reuses existing route vocabulary, and stays small enough for one heartbeat.

## Chosen Direction

Add a shared helper in `shared/game-core.js` that converts the routed encounter profile into a compact Boss-victory recap line:

- `缓冲路线 · 稳线收官`
- `高压路线 · 顶压收官`
- `淘金路线 · 带赏收官`

`LevelScene` already passes the routed encounter profile into `BossScene`. `BossScene` should preserve the resolved Boss-victory recap from scene data and append it to the victory detail lines before the defeat dialog appears. The recap should stay route-level only, not recommendation-reason-specific, so the line reads as a whole-segment conclusion rather than another room-3 tactic note.

## Design Notes

- Keep the mapping in the shared run-event encounter helper area beside the Boss-door recap and Boss-opening echo helpers.
- Reuse the same route labels the player already saw at the Boss door and opening.
- Append the recap once in the victory detail stack; do not add a new persistent panel or extra floating burst.
- Keep the victory line independent from loot lines so the settlement still reads cleanly when rewards are long.

## Testing

- Shared helper assertions for `breather`, `pressure`, `windfall`, and unknown/missing profiles.
- Scene-glue assertions proving `BossScene` resolves the helper from `data.runEventEncounterProfile`.
- Runtime-source assertions proving the Boss-victory recap is appended to the victory detail `lines` before the dialog handoff.

## Assumption

This heartbeat is running in a required non-interactive automation flow, so the design is treated as self-approved for this cycle.
