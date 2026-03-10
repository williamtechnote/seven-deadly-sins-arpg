# Challenge Angle Book-Title Mixed Decorators Design

## Context

`shared/game-core.js` already strips nested decorator wrappers recursively as long as each wrapper family exists in `RUN_CHALLENGE_DECORATOR_PAIRS`. The next uncovered contract gaps in `TODO.md` are nested square+angle wrappers, and the cleanest adjacent follow-up is nested square+book-title wrappers because both reuse existing bracket families without adding new runtime rules.

## Options

1. Promote the already-supported nested square+angle and nested square+book-title paths into explicit tests and docs.
   Trade-off: mostly contract work, but it keeps the documented surface aligned with the actual helper behavior.

2. Add more exotic nested quote combinations next, such as square+corner-quote.
   Trade-off: valid future work, but it overlaps the existing `【「挑战」】` nested mixed example more heavily.

3. Refactor the decorator parser before adding more contract cases.
   Trade-off: more churn with no observed runtime gap, because the current recursive stripper already handles these wrappers.

## Decision

Choose option 1. This cycle should update `TODO.md` ordering, lock square+angle and square+book-title examples into `scripts/regression-checks.mjs`, and sync the README/help-overlay wrapper lists so the documented contract catches up with the shared helper.
