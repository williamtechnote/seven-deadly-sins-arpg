# Challenge Corner-Angle ASCII Square Design

## Context

`shared/game-core.js` already strips nested run-challenge decorator wrappers recursively through `RUN_CHALLENGE_DECORATOR_PAIRS`. The remaining gap in this wrapper lane is explicit contract coverage for corner-angle mixed with ASCII square brackets.

## Options

1. Continue the corner-angle lane with the current `〈[挑战]〉` item, the reverse `[〈挑战〉]` item, and one queued follow-up.
   Recommended because it keeps the audit trail contiguous and should stay doc/test-heavy.
2. Jump to a different wrapper family next.
   Lower value because it leaves the corner-angle lane half-documented again.
3. Refactor the cleaner before adding more matrix entries.
   Unnecessary unless the new regression assertions uncover a real parsing gap.

## Selected Scope

- Implement `〈[挑战]〉` / `[〈本局挑战〉]`.
- Implement `[〈挑战〉]` / `〈[本局挑战]〉`.
- Queue `〈【挑战】〉` / `【〈本局挑战〉】` as the next active follow-up.
