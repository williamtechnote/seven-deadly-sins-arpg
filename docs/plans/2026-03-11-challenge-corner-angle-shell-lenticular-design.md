# Challenge Corner-Angle Shell Lenticular Design

## Context

`TODO.md` is empty, but the current heartbeat lane is still the run-challenge decorator contract. `shared/game-core.js` already strips nested wrappers recursively through `RUN_CHALLENGE_DECORATOR_PAIRS`, and the most contiguous uncovered slice after the finished white-square corner-angle work is the remaining corner-angle mixed family.

## Options

1. Continue the corner-angle lane with shell, lenticular, then curly double-quote mixed wrappers.
   Recommended because it stays adjacent to the just-finished corner-angle bracket cases and should remain doc/test-heavy unless the red tests expose a parser gap.
2. Jump to another wrapper family.
   Lower value because it leaves the corner-angle audit trail half-finished again.
3. Refactor the shared normalizer first.
   Unnecessary unless new regression cases prove the existing recursive stripper is incomplete.

## Selected Scope

- Implement `〈〔挑战〕〉` / `〔〈本局挑战〉〕`.
- Implement `〈〖挑战〗〉` / `〖〈本局挑战〉〗`.
- Queue `〈“挑战”〉` / `“〈本局挑战〉”` as the next active follow-up.
