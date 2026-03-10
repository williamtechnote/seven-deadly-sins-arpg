# Full-Width Square Quote-Family Mixed Wrapper Design

**Context**

The run-challenge sidebar label sanitizer already strips nested decorator wrappers recursively through `RUN_CHALLENGE_DECORATOR_PAIRS` in [shared/game-core.js](/Users/william.chenwl/work/seven-deadly-sins-arpg/shared/game-core.js). Recent heartbeat cycles have been turning that generic behavior into explicit contract coverage, one nested full-width-square wrapper family at a time. The remaining gap in this slice is the quote-family variants that are not yet called out in `TODO.md`, `README.md`, or the help overlay copy in [game.js](/Users/william.chenwl/work/seven-deadly-sins-arpg/game.js).

**Approaches**

1. Extend the contract only: add regression assertions plus README/help/TODO/design coverage for the next wrapper pairs while reusing the existing normalization code.
Recommended because the parser already supports these pairs and the current risk is undocumented behavior drifting without tests.

2. Refactor the decorator stripping helper while adding the new pairs.
Rejected because there is no demonstrated parser bug here, so refactoring would expand the blast radius for a documentation-and-regression task.

3. Leave the generic parser undocumented and rely on existing coverage.
Rejected because the heartbeat backlog is explicitly tracking wrapper-family rollout as an auditable contract, not as an implicit side effect.

**Design**

- Keep `shared/game-core.js` behavior unchanged unless the new failing assertions expose a real gap.
- Promote the existing active item for `［〝挑战〞］` / `〝［本局挑战］〞`.
- Brainstorm and queue three immediate follow-ups in the same family order:
  - `［〝挑战〟］` / `〝［本局挑战］〟`
  - `［『挑战』］` / `『［本局挑战］』`
  - `［｢挑战｣］` / `｢［本局挑战］｣`
- Implement the first two active items this cycle by:
  - adding failing `getRunChallengeSafeSidebarLabel(...)` assertions first,
  - adding failing README/help-overlay contract assertions,
  - updating `README.md`, [game.js](/Users/william.chenwl/work/seven-deadly-sins-arpg/game.js), and `TODO.md`,
  - rerunning the targeted regression script, then the full required verification command.

**Testing**

- Red: `node scripts/regression-checks.mjs` should fail after the new assertions land, primarily on missing README/help contract text.
- Green: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
