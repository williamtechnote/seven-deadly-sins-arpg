# Challenge Full-Width Square Square And White-Square Mixed Design

## Context

`shared/game-core.js` already strips nested decorator wrappers recursively, so the remaining gap for this heartbeat is the explicit contract for the next two active full-width-square mixed wrapper pairs. The parser behavior exists; the auditable README/help/regression coverage does not.

## Goal

- Implement the first two active TODO items:
  - `［【挑战】］` / `【［本局挑战］】`
  - `［〚挑战〛］` / `〚［本局挑战］〛`
- Keep the same recursive decorator stripping, repeated-prefix dedupe, and `未知挑战` fallback chain.
- Leave the white tortoise-shell variant queued next.

## Options

### Option 1: Contract-only follow-up (recommended)

- Pros: matches the current reality that runtime parsing already works.
- Pros: keeps the heartbeat focused on tests, docs, TODO bookkeeping, and auditability.
- Cons: the TDD red step fails on missing README/help text instead of a runtime parser bug.

### Option 2: Refactor the decorator stripper first

- Pros: might reduce future copy churn.
- Cons: unnecessary scope because this wrapper pair already normalizes correctly.

### Option 3: Skip ahead to another wrapper family

- Pros: none beyond variety.
- Cons: breaks the queue discipline in `TODO.md`.

## Selected Design

- Choose option 1.
- Add regression assertions for safe label cleanup, regular summary rendering, compact invalid-target fallback, and README/help overlay coverage for both wrapper pairs.
- Update `README.md` and `game.js` to list the two new examples inside the existing grouped wrapper-family guidance.
- Move the first two active TODO items to `Completed` and keep the white tortoise-shell entry active.

## Testing

- Red: `node scripts/regression-checks.mjs`
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
