# Challenge Corner-Angle Bracket Mixed Design

## Context

`TODO.md` had only one active run-challenge wrapper task left, and its square/corner-angle example needed to be normalized before the next heartbeat could continue cleanly. `shared/game-core.js` already strips decorator wrappers recursively through `RUN_CHALLENGE_DECORATOR_PAIRS`, so the remaining work is explicit contract coverage for the next corner-angle + bracket-family combinations.

## Options

1. Keep the corner-angle lane contiguous by covering square first, then the nearest bracket-family follow-ups.
   Recommended because it extends the same parser contract with minimal runtime risk and keeps the audit trail easy to scan.
2. Jump to unrelated decorator families next.
   Lower value because it leaves the current corner-angle lane half-finished.
3. Refactor the parser before adding more assertions.
   Unnecessary unless the new regression cases expose a real runtime gap.

## Selected Scope

- Implement `〈【挑战】〉` / `【〈本局挑战〉】`.
- Implement `〈〘挑战〙〉` / `〘〈本局挑战〉〙`.
- Queue `〈〚挑战〛〉` / `〚〈本局挑战〉〛` as the next active follow-up.
