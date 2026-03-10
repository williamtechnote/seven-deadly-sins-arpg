# Challenge Ornamental/Bracket Mixed Decorators Design

## Context

`TODO.md` only had one active nested-wrapper task left, so this heartbeat needs to queue adjacent follow-ups before implementing the earliest two items. `shared/game-core.js` already strips decorator prefixes recursively via `RUN_CHALLENGE_DECORATOR_PAIRS`, which means nested square + quote/bracket wrappers can usually inherit support without new parser branches. The remaining gap is explicit contract coverage for the next mixed families: ornamental low double-prime, white tortoise-shell brackets, and white square brackets.

## Options

1. Promote ornamental low double-prime, white tortoise-shell, and white square mixed wrappers into explicit regression and doc coverage.
   Trade-off: mostly contract work, but it matches the existing pair-driven helper and preserves TODO continuity.

2. Skip ahead to a broader decorator refactor before adding more mixed-wrapper cases.
   Trade-off: adds code churn without evidence of a parser failure because recursion already handles nested wrappers generically.

3. Only update TODO ordering and defer docs/tests until a real bug appears.
   Trade-off: cheapest short term, but it leaves README/help text and regression coverage behind the runtime behavior again.

## Decision

Choose option 1. This cycle should:

- reprioritize `TODO.md` with the three mixed-wrapper follow-ups,
- implement the first two items in order,
- treat the work as TDD against `scripts/regression-checks.mjs`,
- only touch `shared/game-core.js` if the new red-state assertions expose a real parsing gap.

The requested branch name is `feat/auto-challenge-ornamental-bracket-mixed`, but local branch creation is currently blocked by git ref-lock permissions. The fallback is to keep working on the current branch, then push `HEAD` to that remote feature-branch name and record the blocker in `PROGRESS.log`.
