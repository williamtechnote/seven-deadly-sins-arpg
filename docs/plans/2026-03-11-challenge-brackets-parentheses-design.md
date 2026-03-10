# Challenge Brackets Parentheses Design

## Context

`shared/game-core.js` already strips more challenge-label decorator families than the user-facing contract currently documents. The next uncovered families are full-width square brackets (`［］`) and round/full-width parentheses (`()` / `（）`).

## Options

1. Document and regress the already-supported wrapper families.
   Trade-off: no runtime behavior change, but it turns implicit support into an explicit contract.

2. Refactor the decorator list and add new families at the same time.
   Trade-off: more churn for no observed bug because the helper already passes the relevant examples.

3. Skip the docs and rely on the shared helper behavior.
   Trade-off: leaves the README/help overlay and regression contract behind the actual implementation.

## Decision

Choose option 1. The helper already normalizes `［挑战］`, `［本局挑战］`, `(挑战)`, and `（本局挑战）`, so this cycle should promote those paths into the explicit README/help/regression contract and re-seed `TODO.md` with the next nested follow-up.
