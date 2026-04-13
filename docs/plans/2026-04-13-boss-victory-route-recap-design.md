# Boss Victory Route Recap Design

Inferred from the current repo state and TODO history because this heartbeat cycle forbids interactive clarification.

## Problem

Route identity already reaches the routed room's clear recap, but the boss victory summary still collapses back to generic reward lines. That weakens the perceived payoff of the routed segment because the last visible beat no longer answers how the earlier shrine choice shaped the completed run slice.

## Approaches Considered

### Recommended: shared victory recap line in the existing victory summary

- Pros: reuses the routed encounter profile already passed into `BossScene`, keeps copy in the same place as rewards, easy to cover with deterministic tests.
- Cons: one more line in the victory stack, so copy must stay compact.

### Alternative: floating combat text on boss death

- Pros: immediate.
- Cons: overlaps with defeat cleanup, easier to miss, duplicates the Boss-opening echo pattern instead of closing it.

### Alternative: dialog-only recap

- Pros: no HUD layout change.
- Cons: too delayed and too easy to bury beneath defeat dialog pacing.

## Design

- Add a shared helper in `shared/game-core.js` that maps the routed encounter profile to a compact victory line.
- Pass the routed encounter profile from `LevelScene` into `BossScene` and resolve the helper there.
- Insert the line into the `Victory!` summary before rewards/progress so the segment closes alongside the reward bundle.
- Document the new closure beat in README and methodology docs.

## Testing

- Add regression assertions for the new shared helper outputs.
- Add source-pattern assertions that `BossScene` resolves the helper from the routed profile and appends the line into the victory summary.
- Keep the exact required repo verification command as the final gate.
