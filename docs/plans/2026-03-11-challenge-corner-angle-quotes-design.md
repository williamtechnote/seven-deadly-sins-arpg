# Challenge Corner-Angle Quote Mixed Design

## Context

`TODO.md` only had one active corner-angle wrapper task left. `shared/game-core.js` already strips nested decorators recursively through `RUN_CHALLENGE_DECORATOR_PAIRS`, so this heartbeat should keep the lane contiguous by making the next quote-family combinations explicit in regression coverage and docs.

## Options

1. Continue the corner-angle lane with curly double-quote, curly single-quote, then ASCII straight-quote mixed wrappers.
   Recommended because it stays adjacent to the just-finished shell/lenticular work and should remain doc/test-heavy unless the red tests expose a parser gap.
2. Jump to another wrapper family next.
   Lower value because it leaves the corner-angle audit trail half-finished again.
3. Refactor the shared normalizer before extending coverage.
   Unnecessary unless the new assertions prove the recursive stripper misses one of these quote wrappers.

## Selected Scope

- Implement `〈“挑战”〉` / `“〈本局挑战〉”`.
- Implement `〈‘挑战’〉` / `‘〈本局挑战〉’`.
- Queue `〈"挑战"〉` / `"〈本局挑战〉"` as the next active follow-up.
