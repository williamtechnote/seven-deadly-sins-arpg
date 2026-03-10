# Challenge Square Mixed Decorators Design

## Context

`TODO.md` only had one active nested-wrapper item left, but the heartbeat cycle requires implementing the earliest two active items. The existing recursive decorator stripping in `shared/game-core.js` already handles nested wrappers generically across `【】`, `［］`, and `[]`, so the remaining gap is explicit contract coverage and documentation for the square-bracket family combinations that are not yet spelled out.

## Brainstormed Queue

1. `nested square/full-width square mixed decorator wrappers`
2. `nested square/ASCII square mixed decorator wrappers`
3. `nested full-width square/ASCII square mixed decorator wrappers`

## Options

1. Add explicit regression/doc coverage for the three square-bracket combinations while reusing the current recursive helper.
   Trade-off: low implementation risk and keeps the TODO lane moving in the same narrow direction.

2. Refactor the decorator parser into a broader token grammar first.
   Trade-off: more churn without evidence that recursion is the problem.

3. Leave runtime behavior implicit and only keep the single TODO item.
   Trade-off: fails the heartbeat requirement to implement two active items and keeps docs/tests behind actual support.

## Decision

Choose option 1. This cycle should promote the three square-bracket combinations into the active queue, implement the first two via regression-first updates, and only touch parsing code if the new red-state assertions uncover a real gap.

The requested local branch is `feat/auto-challenge-square-mixed`. If local branch creation stays blocked by git ref locks, the fallback is to keep working on the current branch, then push `HEAD` to `refs/heads/feat/auto-challenge-square-mixed` and record the blocker in `PROGRESS.log`.
