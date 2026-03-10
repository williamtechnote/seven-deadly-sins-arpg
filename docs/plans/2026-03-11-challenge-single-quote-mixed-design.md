# Challenge Single-Quote Mixed Decorators Design

## Context

`shared/game-core.js` already strips nested challenge decorator wrappers recursively as long as both wrapper families are present in `RUN_CHALLENGE_DECORATOR_PAIRS`. The remaining gap for the next heartbeat lane is explicit contract coverage in `TODO.md`, `README.md`, the in-game help overlay, and `scripts/regression-checks.mjs` for the quote-family nested combinations that are still implicit.

## Goal

- Reprioritize `TODO.md` to three adjacent nested-wrapper follow-ups: curly single-quote `‘’`, ASCII single-quote `''`, and full-width square `［］`.
- Implement the first two this cycle by locking curly single-quote and ASCII single-quote mixed wrappers into regression, README, and help-overlay coverage.
- Leave full-width square mixed wrappers queued next.

## Options

### Option 1: Treat this as contract coverage only (recommended)

- Pros: matches current reality because the shared helper already supports these wrapper pairs.
- Pros: keeps the cycle scoped to tests, docs, help copy, and audit artifacts.
- Cons: the red step will fail on missing regression/doc assertions rather than missing runtime logic.

### Option 2: Refactor the decorator cleaner before adding more examples

- Pros: could reduce future repetition.
- Cons: unnecessary churn for a path that already works in runtime.

### Option 3: Skip the single-quote pairing and jump to a different wrapper family

- Pros: none beyond variety.
- Cons: breaks the existing adjacency of the nested mixed-wrapper queue and makes the next TODO less predictable.

## Selected Design

- Choose option 1.
- Update `TODO.md` so the active lane is curly single-quote, ASCII single-quote, then full-width square mixed wrappers.
- Add explicit regression assertions for:
  - `getRunChallengeSafeSidebarLabel(...)`
  - full regular `buildRunChallengeSidebarLines(...)`
  - compact invalid-target fallback summaries
  - README/help-overlay copy mentioning the two implemented wrapper pairs
- Keep runtime behavior unchanged unless the new regression cases expose a real parsing gap.

## Testing

- Red: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
- Green: rerun the same command after updating README/help copy and any minimal code/docs needed by the new assertions.
