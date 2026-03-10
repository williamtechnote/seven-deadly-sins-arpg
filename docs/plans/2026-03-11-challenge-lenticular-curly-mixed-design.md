# Challenge Lenticular And Curly-Quote Mixed Design

## Context

`shared/game-core.js` already normalizes nested decorator wrappers recursively when both wrapper families exist in `RUN_CHALLENGE_DECORATOR_PAIRS`. The remaining gap in this lane is contract coverage for more nested combinations that are already implied by the runtime table but not yet locked in through README/help text, regression assertions, and TODO ordering.

## Goal

- Rebuild `TODO.md` so the active queue has three adjacent mixed-wrapper follow-ups: lenticular `〖〗`, curly double quotes `“”`, and curly single quotes `‘’`.
- Implement the first two this cycle: lenticular mixed and curly double-quote mixed wrappers.
- Leave curly single-quote mixed wrappers queued next.

## Options

### Option 1: Contract-first coverage only (recommended)

- Pros: matches the current code, which should already normalize these wrappers through the shared decorator table.
- Pros: keeps scope limited to tests, docs, TODO bookkeeping, and the heartbeat audit trail.
- Cons: the red step will likely fail on documentation assertions rather than runtime behavior.

### Option 2: Refactor decorator stripping before adding more wrapper combinations

- Pros: might reduce future repetition.
- Cons: unnecessary without an observed runtime gap.

### Option 3: Jump to an unrelated wrapper family

- Pros: none beyond novelty.
- Cons: breaks the established queue and makes the active TODO lane harder to audit.

## Selected Design

- Choose option 1.
- Add explicit regression assertions for:
  - `getRunChallengeSafeSidebarLabel(...)`
  - regular `buildRunChallengeSidebarLines(...)`
  - compact invalid-target fallback summaries
  - README/help-overlay copy mentioning the two implemented mixed-wrapper examples
- Keep runtime changes minimal and only touch `shared/game-core.js` if the new assertions reveal a real parsing gap.

## Testing

- Red: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
- Green: rerun the same command after updating docs/tests and any required helper logic.
