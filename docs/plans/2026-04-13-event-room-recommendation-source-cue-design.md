# Event Room Recommendation Source Cue Design

## Context

High-confidence event-room recommendations already survive across four surfaces:

- choice-panel footer
- post-choice settlement receipt
- room-3 entry preview
- room-3 clear recap

That makes the route legible before and after commitment, but the actual fight still has a gap: the first meaningful combat beat does not explicitly confirm why the route was recommended. The methodology docs for this repo keep pointing at the same target: the next combat decision should cash in the route quickly and readably.

## Options

1. Add more entry/clear copy only.
Rejected: it repeats the existing arc without improving the live combat beat.

2. Add scene-specific one-offs in `game.js`.
Rejected: it would be harder to audit and easier for combat copy to drift away from the shared recommendation contract.

3. Extend shared encounter feedback with one-shot combat source cues.
Recommended: it keeps the rule deterministic, reuses the persisted recommendation reason, and lets runtime only decide when the cue should fire.

## Chosen Direction

Add a shared helper that translates a strong route + recommendation pairing into a one-shot combat cue for a specific room-3 moment:

- `缓冲战`: fire on the first stabilization node, i.e. the first room-3 kill while another routed enemy still remains alive
- `高压战`: fire on the first real pressure-contact moment, i.e. the first room-3 attack attempt
- `淘金战`: fire on the first routed bounty payoff, i.e. the marked bounty target death receipt

The cue text should stay compact and reuse the same reason language already established by the encounter echo contract:

- `净化后稳场`
- `回线稳场`
- `守心稳场`
- `压线抢势`
- `血线够追赏`

If no persisted recommendation reason still maps strongly to the routed encounter, the runtime should stay silent.

## Design Notes

- `shared/game-core.js` remains the source of truth for cue text and allowed trigger moments.
- `game.js` only detects the room-3 moment and displays the shared cue once.
- Windfall should piggyback on the existing bounty payoff hook rather than creating a parallel kill event.
- The new cue must be one-shot per routed profile to avoid spam.

## Success Criteria

- A recommended `缓冲战` route shows one shared source cue at its first stabilize beat.
- A recommended `高压战` route shows one shared source cue at its first pressure-contact beat.
- A recommended `淘金战` route shows one shared source cue at its first bounty payoff beat.
- Shared helper coverage, runtime regex checks, and README/help text all describe the same contract.
