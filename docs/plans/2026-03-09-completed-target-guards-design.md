# Completed Target Guards Design

**Context**

The recent challenge/sidebar work already guards invalid `target<=0` data for in-progress summaries and hidden badges. The remaining adjacent gap is in the regular three-line completed summary: it reuses the same invalid-target fallback as in-progress summaries, so corrupted completed data can render `进行中` on the third line.

**Approaches**

1. Split the regular completed helper from the in-progress helper.
Recommended because it fixes the incorrect state copy at the narrowest possible seam, preserves compact and ultra-compact behavior, and keeps the existing regular layout intact.

2. Force completed summaries to synthesize `progress/target` from completion state.
Rejected because inventing `30/30`-style ratios from invalid data is misleading and would reintroduce fake precision.

3. Collapse regular completed summaries to the compact/ultra-compact completed ladder whenever `target<=0`.
Rejected because it changes the layout shape instead of just correcting the bad third-line semantics.

**Design**

- Keep `buildRunChallengeSidebarLines()` unchanged at the call site.
- Change `getRunChallengeRegularCompletedDetailVariants()` so empty `progressLabel` falls back to completed-state text instead of in-progress text:
  - `已完成  奖励:+90金`
  - `已完成`
- Leave the normal `progressLabel` path unchanged so valid completed summaries still use `进度:30/30  奖励:+90金 -> 进度:30/30 -> 30/30`.
- Add regression coverage for:
  - completed invalid target with reward
  - completed invalid target without reward
  - completed invalid target with label collapse to `未知挑战`
- Sync `README.md` and the in-game help copy in `game.js` to document the completed-state invalid-target fallback.

**Testing**

- Add the regression assertions first and run `node scripts/regression-checks.mjs` to confirm the current helper fails.
- After the minimal fix, run the required heartbeat verification command exactly.
