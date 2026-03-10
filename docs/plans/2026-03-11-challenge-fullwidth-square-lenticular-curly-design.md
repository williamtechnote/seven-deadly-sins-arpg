# Challenge Full-Width Square Lenticular And Curly-Quote Mixed Design

## Context

`shared/game-core.js` already lists `［］`, `〖〗`, and `“”` in the shared run-challenge decorator table, so the next two full-width-square mixed TODOs should be covered by the existing recursive stripping path. The missing part is auditable contract coverage across regression checks, README copy, in-game help copy, and backlog bookkeeping.

## Goal

- Implement the two active TODO items for `［〖挑战〗］` / `〖［本局挑战］〗` and `［“挑战”］` / `“［本局挑战］”`.
- Keep the existing decorator stripping, prefix dedupe, and `未知挑战` fallback behavior unchanged unless a new regression exposes a parser gap.
- Leave the next full-width-square quote follow-ups queued as curly single-quote first, then ASCII single-quote.

## Options

### Option 1: Contract-first coverage only (recommended)

- Pros: matches the current runtime behavior and keeps scope limited to tests, docs, and TODO/progress records.
- Pros: the TDD red step can fail on documentation gaps without forcing speculative parser refactors.
- Cons: most code changes are documentation-facing rather than runtime logic.

### Option 2: Refactor the decorator stripping helper first

- Pros: might reduce future repetition.
- Cons: unnecessary without a failing runtime assertion.

### Option 3: Skip ahead to another wrapper family

- Pros: none beyond novelty.
- Cons: breaks the active TODO queue and weakens the audit trail.

## Selected Design

- Choose option 1.
- Add regression assertions for the two new wrapper families in `scripts/regression-checks.mjs`.
- Update `README.md` and the in-game help overlay copy in `game.js` to mention the two new nested full-width-square examples.
- Promote the two completed TODO items and queue the next two full-width-square quote follow-ups.

## Testing

- Red: `node scripts/regression-checks.mjs`
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
