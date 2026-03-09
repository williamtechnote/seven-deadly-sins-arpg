# Compact Challenge Tight Labels Design

**Context**

The active heartbeat work is the compact challenge sidebar's second line. It already drops the reward chunk before Phaser falls back to generic ellipsis, but under a narrower width budget the remaining label still overflows and loses readability.

**Approaches**

1. Add a whitespace-tightened semantic label fallback before generic truncation.
Recommended because it is a minimal behavior change, keeps the current copy, and works for both gold-only and future compound reward labels.

2. Add a separate handcrafted short label field for compact mode.
Rejected for now because it expands content authoring scope and duplicates information already derivable from the existing label.

3. Accept generic ellipsis once the reward is dropped.
Rejected because it leaves the current TODO unresolved and degrades readability precisely in the narrow-budget case we are guarding.

**Design**

- Keep the current compact detail fallback order as the first two variants: `label + reward`, then `label`.
- Add one more semantic fallback variant by removing interior whitespace from the normalized label, for example `击败 30 个敌人 -> 击败30个敌人`.
- Reuse the same helper for compact in-progress and compact completed detail lines so both paths stay aligned for future compound reward labels.
- Document the tighter fallback chain in `README.md` and the in-game help overlay copy in `game.js`.
- Add regression coverage first for the narrower in-progress and completed compound-reward paths.

**Testing**

- Extend `scripts/regression-checks.mjs` with failing tests for compact in-progress and compact completed challenge summaries at a budget where the spaced label no longer fits but the whitespace-tightened label still does.
- Run the required heartbeat verification command exactly after implementation.
