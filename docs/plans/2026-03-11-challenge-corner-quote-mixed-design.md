# Challenge Corner-Quote Mixed Decorators Design

## Context

`shared/game-core.js` already strips nested challenge decorator wrappers recursively as long as each wrapper family exists in `RUN_CHALLENGE_DECORATOR_PAIRS`. The current backlog has only one active item, so this cycle needs to queue adjacent follow-ups before implementation. The remaining quote-family mixed wrappers are the cleanest next slice because they reuse the same recursive stripping path without introducing new parsing rules.

## Options

1. Promote corner-quote, half-width corner-quote, and presentation-form mixed wrappers into explicit contract coverage.
   Trade-off: mostly regression/doc work, but it keeps TODO ordering aligned with the helper's existing behavior.

2. Skip to ornamental quote mixed wrappers next.
   Trade-off: still valid future work, but it is a larger surface and less contiguous with the currently active corner-quote item.

3. Refactor the decorator cleaner before adding more nested wrapper contracts.
   Trade-off: more churn with no observed runtime gap, because the shared helper already handles recursive mixed wrappers generically.

## Decision

Choose option 1. This cycle should reprioritize `TODO.md` with the next three quote-family mixed wrapper candidates, then implement the first two by locking them into regression checks plus README/help-overlay docs. Runtime code should change only if the new red-state assertions uncover a real parser gap.
