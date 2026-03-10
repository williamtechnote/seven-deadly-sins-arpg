# Challenge Corner-Angle Mixed Design

## Context

`shared/game-core.js` already strips decorator wrappers recursively as long as each wrapper family exists in `RUN_CHALLENGE_DECORATOR_PAIRS`. The current backlog has only one active item left, so this heartbeat needs to queue adjacent follow-ups before implementing the earliest two. The cleanest next slice is the corner-angle family because the parser already knows both `〈〉` and square wrappers.

## Options

1. Extend the contract for the current `［〈挑战〉］` item, then queue reverse corner-angle variants.
   Recommended because it keeps the wrapper audit lane contiguous and should require only regression/doc sync.
2. Jump to a different wrapper family next.
   Lower value because it leaves the corner-angle audit trail half-finished.
3. Refactor the parser before adding more wrapper assertions.
   Unnecessary churn unless the new red-state regressions expose a real runtime gap.

## Selected Scope

- Implement `［〈挑战〉］` / `〈［本局挑战］〉`.
- Implement `〈［挑战］〉` / `［〈本局挑战〉］`.
- Queue `〈[挑战]〉` / `[〈本局挑战〉]` as the next active follow-up.
