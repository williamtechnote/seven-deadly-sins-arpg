# Regular Challenge Line Fallbacks Design

**Context**

The current sidebar challenge work already protects compact and ultra-compact summaries with semantic fallback ladders. The regular three-line challenge summary still renders its third line as a single `进度:...  奖励:...` string, so under a narrower width budget Phaser falls straight to generic ellipsis and can hide either the progress ratio or the reward-first context too early.

**Approaches**

1. Add a shared semantic fallback ladder for the regular third line.
Recommended because it is the smallest behavior change, keeps the existing regular layout, and aligns the narrow-budget policy with the compact and ultra-compact ladders.

2. Collapse regular mode into the compact two-line summary earlier.
Rejected because it changes more of the regular layout than needed and makes the “regular” tier less informative even when vertical space is still available.

3. Accept the current generic ellipsis behavior.
Rejected because the remaining gap is exactly in the challenge/sidebar text-budget guard area called out by `TODO.md`.

**Design**

- Add a helper that builds regular third-line variants for both in-progress and completed states:
  - `进度:12/30  奖励:+90金`
  - `进度:12/30`
  - `12/30`
- Reuse the same helper for completed states, with `30/30` or future ratios derived from the challenge state.
- Keep future explicit `rewardLabel` values on the first variant only so compound rewards still ride the same fallback chain before dropping to progress-first copy.
- Route the regular third line through `pickChallengeLabelVariant` with the same measured width hook already used elsewhere in challenge summary generation.
- Sync `README.md` and the in-game help text in `game.js` to document the new regular fallback chain.

**Testing**

- Add failing regression checks first for regular in-progress and regular completed summaries at widths where the reward-bearing third line no longer fits, but the `进度:...` and final bare-ratio variants still should.
- Keep a compound reward regression to confirm regular mode reuses the same chain when `rewardLabel` expands to `+9999金 +净化`.
- Run the required heartbeat verification command exactly after implementation.
