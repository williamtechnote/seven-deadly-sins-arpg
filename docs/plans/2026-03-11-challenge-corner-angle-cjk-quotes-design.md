# Challenge Corner-Angle CJK Quote Decorators Design

## Context

`shared/game-core.js` already normalizes nested challenge decorator wrappers recursively as long as the wrapper families exist in `RUN_CHALLENGE_DECORATOR_PAIRS`. The remaining active TODO lane is to formalize the last missing `corner-angle` mixed quote families in regression coverage and user-facing copy: half-width corner quotes `｢｣` and presentation-form quotes `﹁﹂` / `﹃﹄`.

## Goal

- Keep the first two active TODO items focused on nested `corner-angle/half-width corner-quote` and `corner-angle/presentation-form` mixed wrappers.
- Lock those two wrapper families into regression assertions for both normalized labels and sidebar summaries.
- Update README/help copy and TODO bookkeeping so the implemented contract is explicit, then leave the next mixed-wrapper lane queued.

## Options

### Option 1: Contract coverage only (recommended)

- Pros: matches the current implementation because the shared decorator table already recognizes both quote families.
- Pros: keeps the cycle scoped to tests, docs, help copy, and audit artifacts.
- Cons: the red step should fail on missing regression/doc assertions rather than missing parser logic.

### Option 2: Refactor the decorator cleaner first

- Pros: could reduce future repetition.
- Cons: unnecessary churn for a parser path that already supports these wrappers.

### Option 3: Skip to a different wrapper family

- Pros: none beyond variety.
- Cons: breaks the TODO queue ordering and makes the next heartbeat less predictable.

## Selected Design

- Choose option 1.
- Add explicit regression assertions for:
  - `getRunChallengeSafeSidebarLabel(...)`
  - regular and compact `buildRunChallengeSidebarLines(...)`
  - README/help-overlay copy mentioning `〈｢挑战｣〉` / `｢〈本局挑战〉｣` and `〈﹁挑战﹂〉` / `﹃〈本局挑战〉﹄`
- Keep runtime normalization unchanged unless the new assertions reveal a real gap.

## Testing

- Red: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
- Green: rerun the same command after the regression/docs/help/TODO updates land.
