# Challenge Full-Width Square Tortoise And Presentation Mixed Design

## Context

`shared/game-core.js` already normalizes nested decorator prefixes recursively. The remaining gap in this heartbeat is contract coverage for the next undocumented nested full-width square wrapper pairs.

## Goal

- Implement the first two prioritized follow-ups:
  - `［〘挑战〙］` / `〘［本局挑战］〙`
  - `［﹁挑战﹂］` / `﹃［本局挑战］﹄`
- Keep the existing recursive decorator stripping, repeated-prefix dedupe, and `未知挑战` fallback behavior unchanged.
- Leave `［〝挑战〞］` / `〝［本局挑战］〞` queued next.

## Options

### Option 1: Contract-only update (recommended)

- Pros: matches the current state where runtime normalization already works.
- Pros: keeps scope on regression coverage, help text, README, and backlog bookkeeping.
- Cons: the red step fails on missing docs/help assertions rather than parser logic.

### Option 2: Refactor decorator handling first

- Pros: could centralize future wording updates.
- Cons: unnecessary scope because the parser table already supports these wrappers.

### Option 3: Skip to a different wrapper family

- Pros: none beyond variety.
- Cons: breaks queue discipline in `TODO.md`.

## Selected Design

- Choose option 1.
- Add regression assertions for safe label cleanup, regular summary rendering, compact invalid-target fallback, and README/help overlay coverage for both wrapper pairs.
- Extend the grouped README and in-game help copy with one extra sentence documenting the two newly formalized wrapper pairs.
- Mark the first two active TODO items complete and keep the ornamental double-prime pair active.

## Testing

- Red: `node scripts/regression-checks.mjs`
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
