# Challenge Presentation/Ornamental Mixed Decorators Design

## Context

`shared/game-core.js` already strips nested challenge decorators recursively as long as each wrapper family exists in `RUN_CHALLENGE_DECORATOR_PAIRS`. After the recent corner-quote cycles, only one active TODO remained, so this heartbeat needs to queue adjacent follow-ups before implementation. The next contiguous slice is the remaining quote-family nested square wrappers: presentation-form, ornamental double-prime, and ornamental low double-prime.

## Options

1. Promote presentation-form, ornamental double-prime, and ornamental low double-prime mixed wrappers into explicit contract coverage.
   Trade-off: mostly regression/doc work, but it keeps TODO ordering aligned with the helper's existing recursive behavior.

2. Skip ahead to white tortoise-shell and white square mixed wrappers.
   Trade-off: still valid follow-ups, but they are less contiguous than finishing the remaining quote-family combinations first.

3. Refactor the decorator cleaner before adding more nested mixed contracts.
   Trade-off: adds churn without a demonstrated parser gap because the shared helper is already pair-driven and recursive.

## Decision

Choose option 1. This cycle should reprioritize `TODO.md` with the next three quote-family mixed wrapper candidates, then implement the first two by locking presentation-form and ornamental double-prime mixed wrappers into regression checks plus README/help-overlay docs. Runtime code should change only if the red-state assertions expose a real parsing gap.
