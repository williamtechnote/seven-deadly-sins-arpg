# Encounter Bounty Carriers Design

## Context

`缓冲战 / 高压战 / 淘金战` already route room 3 through different rosters, formations, and engage timing. That makes the opening silhouette more readable, but the reward side still mostly resolves as a room-wide gold scalar. The methodology docs point to a stronger outcome: route payoff should change the next combat decision in a felt, visible way.

## Options

1. Add more preview copy explaining which route is richer.
Rejected: better copy forecasts value, but it still leaves the actual in-room target priority unchanged.

2. Raise `淘金战` room-wide gold again.
Rejected: bigger numbers alone repeat the hidden-math problem and do not help the player decide who to chase first.

3. Route reward weight onto specific room-3 spawn slots.
Recommended: it keeps the encounter deterministic, builds on the existing formation/timing helpers, and turns route payoff into a concrete target-priority decision.

## Chosen Direction

Extend the shared room-3 formation contract so each spawn slot can also carry reward metadata:

- `缓冲战`: keep both low-pressure enemies at stable, near-even reward weight.
- `高压战`: keep the front-loaded three-enemy wedge and spread reward weight evenly enough that the room reads as pressure first, not bounty hunting.
- `淘金战`: keep the front/back stagger, but route extra gold weight and an explicit bounty marker onto the delayed deep target so the player can read the chase target before the kill.

## Design Notes

- `shared/game-core.js` should remain the source of truth by attaching reward metadata to the same formation slots that already define position and engage timing.
- `game.js` should only consume that metadata: scale room-3 enemy gold drops per slot and attach a lightweight in-world bounty tag to marked targets.
- The contract should preserve deterministic totals. `淘金战` should redistribute more of the existing route bonus onto the deep target instead of inflating the whole room again.

## Success Criteria

- `淘金战` exposes one clearly richer delayed target inside room 3.
- `高压战` keeps reward distribution flatter so target order still follows pressure more than bounty.
- `缓冲战` remains readable and low-noise, without introducing an unnecessary chase marker.
- Regression coverage proves both the shared slot metadata and the runtime hook that consumes it.
