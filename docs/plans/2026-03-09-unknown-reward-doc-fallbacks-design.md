# Unknown Reward Fallback Docs Design

**Context**

The challenge sidebar logic already preserves two reward-bearing fallback cases that are not yet called out explicitly in the written docs: regular summaries keep `未知挑战` on the body line while retaining the reward-bearing progress line, and compact summaries keep `未知挑战 · 奖励` as the second-line label when upstream prefix cleanup exhausts the source label. The runtime behavior is already aligned; the gap is documentation and regression coverage.

**Approaches**

1. Document and regression-guard the existing behavior.
Recommended because it is the smallest safe heartbeat delta, keeps runtime behavior stable, and closes the current docs/test gap without reopening the summary helper logic.

2. Refactor the challenge summary helpers again while documenting the result.
Rejected because the helpers already behave correctly and a refactor would create unnecessary risk in a heavily-guarded area.

3. Leave the behavior undocumented.
Rejected because `TODO.md` should not keep accumulating invisible edge cases that only exist in tests or code comments.

**Design**

- Add regression assertions first for the missing README/help-overlay statements covering:
  - regular reward-bearing `未知挑战` fallbacks
  - compact reward-bearing `未知挑战` fallbacks
- Update `README.md` and the in-game help copy in `game.js` with wording that matches the existing runtime behavior.
- Keep the third brainstormed item in `TODO.md` as the next active follow-up after this heartbeat.

**Testing**

- Run `node scripts/regression-checks.mjs` after adding the new assertions and confirm it fails before the docs change.
- Run the full heartbeat verification command after the README/help-copy updates land.
