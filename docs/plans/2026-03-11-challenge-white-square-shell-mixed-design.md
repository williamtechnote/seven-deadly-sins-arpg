# Challenge White-Square And Shell Mixed Design

## Context

`shared/game-core.js` already strips nested decorator wrappers recursively as long as both wrapper families exist in `RUN_CHALLENGE_DECORATOR_PAIRS`. The next gap is no longer runtime parsing, but the explicit contract in `TODO.md`, `README.md`, the in-game help overlay, and `scripts/regression-checks.mjs` for the remaining bracket-family nested combinations.

## Goal

- Reprioritize `TODO.md` to three adjacent bracket-family mixed-wrapper follow-ups: white square `〚〛`, shell `〔〕`, and lenticular `〖〗`.
- Implement the first two this cycle by locking white-square and shell mixed wrappers into README/help/regression coverage.
- Leave lenticular mixed wrappers queued as the next heartbeat item.

## Options

### Option 1: Treat this as contract coverage only (recommended)

- Pros: matches the current reality that the shared helper already normalizes these labels.
- Pros: keeps the scope to tests, docs, TODO bookkeeping, and audit logging.
- Cons: the TDD red step will fail on doc/regression coverage rather than runtime behavior.

### Option 2: Refactor the decorator cleaner before adding more mixed-wrapper examples

- Pros: could reduce future repetition.
- Cons: unnecessary for this lane because no runtime gap exists.

### Option 3: Skip the adjacent shell/lenticular variants and jump to a different wrapper family

- Pros: none beyond variety.
- Cons: breaks the established queue ordering and makes the next TODO less predictable.

## Selected Design

- Choose option 1.
- Update `TODO.md` so the active lane is white square, shell, then lenticular mixed wrappers.
- Add explicit regression assertions for:
  - `getRunChallengeSafeSidebarLabel(...)`
  - full regular `buildRunChallengeSidebarLines(...)`
  - compact invalid-target fallback summaries
  - README/help-overlay copy mentioning the two implemented wrapper pairs
- Because runtime behavior already exists, expect the red step to fail on the new documentation assertions before `README.md` and `game.js` are updated.

## Testing

- Red: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
- Green: rerun the same command after updating docs/tests.
