# Challenge Reward Label Guards Design

**Goal:** Verify that ultra-compact visible run-challenge summaries keep the existing semantic fallback ladder when reward copy grows to `+9999金` and when future data provides a longer compound reward short label.

**Approaches considered:**
- Keep the current width-based ladder and only add `+9999金` regression coverage. Lowest risk, but it leaves future compound reward copy with no shared formatting seam.
- Extract a shared inline reward-label helper and let ultra-compact summary/badge variants consume it. Recommended because it keeps current gold-only behavior unchanged while giving future compound short labels one place to plug into the same fallback ladder.
- Add new intermediate copy variants for long rewards. Rejected because existing measured-width selection already provides semantic fallbacks without extra copy churn.

**Chosen design:** Add a `formatRunChallengeRewardShortLabel` helper in `shared/game-core.js`. It returns an explicit `rewardLabel` when present, otherwise falls back to the existing `+<gold>金` short form. Reuse it for ultra-compact visible summaries and completion badges, propagate optional `rewardLabel` through `game.js`, and add regression coverage that proves `+9999金` plus a future-style compound short label still collapse through the existing ladders instead of introducing new intermediate rungs.
