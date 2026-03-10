# Challenge Full-Width Square Single-Quote Mixed Design

## Context

`shared/game-core.js` already supports `［］`, `‘’`, and `'` in the shared run-challenge decorator table, so the next two active TODO items should flow through the existing recursive decorator stripping path. The missing coverage is the explicit contract in regression checks, README copy, in-game help copy, and backlog history.

## Goal

- Implement the two active TODO items for `［‘挑战’］` / `‘［本局挑战］’` and `［'挑战'］` / `'［本局挑战］'`.
- Preserve the existing decorator stripping, repeated-prefix dedupe, and `未知挑战` fallback behavior.
- Seed the next backlog items so the full-width-square wrapper family can continue without re-prioritization next cycle.

## Options

### Option 1: Contract-first coverage only (recommended)

- Pros: matches the observed runtime behavior and keeps this heartbeat narrowly scoped.
- Pros: the red step can fail on README/help coverage while the shared parser stays untouched.
- Cons: the user-visible change is mostly documentation and audit coverage rather than new runtime logic.

### Option 2: Refactor the decorator stripping helper first

- Pros: could reduce future repetition.
- Cons: unnecessary without a failing runtime assertion.

### Option 3: Skip to a different wrapper family

- Pros: none.
- Cons: breaks TODO order and weakens the audit trail.

## Selected Design

- Choose option 1.
- Add regression assertions for the two new full-width-square single-quote wrapper families in `scripts/regression-checks.mjs`.
- Update `README.md` and the help-overlay contract line in `game.js` to mention both new wrapper pairs.
- Move the two TODO items to Completed and queue three next full-width-square bracket-family follow-ups: `［【挑战】］`, `［〚挑战〛］`, and `［〘挑战〙］`.

## Testing

- Red: `node scripts/regression-checks.mjs`
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
