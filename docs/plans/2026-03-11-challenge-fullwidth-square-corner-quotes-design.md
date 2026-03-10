# Challenge Full-Width Square Corner-Quote Mixed Design

## Context

`shared/game-core.js` already supports `［］`, `『』`, and `｢｣` in the shared run-challenge decorator table, and adjacent regression cases already prove the corresponding fallback path. The remaining gap is explicit contract coverage for the two active full-width-square quote-family wrapper pairs in regression checks, README copy, help-overlay copy, and TODO history.

## Goal

- Implement the two active TODO items for `［『挑战』］` / `『［本局挑战］』` and `［｢挑战｣］` / `｢［本局挑战］｣`.
- Preserve the existing recursive decorator stripping, repeated-prefix dedupe, and `未知挑战` fallback semantics.
- Seed the next three full-width-square wrapper candidates so the backlog stays non-empty after this heartbeat.

## Options

### Option 1: Contract-only sync (recommended)

- Pros: matches the current runtime behavior and keeps the change surface limited to tests, docs, and backlog records.
- Pros: preserves the existing parser instead of refactoring already-green logic.
- Cons: the visible change is documentation-heavy rather than a runtime behavior change.

### Option 2: Refactor the decorator stripping helper first

- Pros: could reduce future repetition.
- Cons: unnecessary because the new runtime assertions already pass.

### Option 3: Skip to another wrapper family

- Pros: none.
- Cons: breaks TODO ordering and weakens the heartbeat audit trail.

## Selected Design

- Choose option 1.
- Add positive regression cases for the two missing full-width-square corner-quote wrapper families.
- Extend `README.md` and the help-overlay contract string in `game.js` to mention both wrapper pairs.
- Move the two active TODO items to Completed and add three new follow-ups: `［＜挑战＞］`, `［《挑战》］`, and `［「挑战」］`.

## Testing

- Red: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
