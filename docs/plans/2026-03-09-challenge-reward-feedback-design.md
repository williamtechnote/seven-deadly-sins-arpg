# Challenge Reward Feedback Design

**Context**

The run challenge sidebar, README, and regression guards all assume the baseline enemy-slayer reward is `+90金`, but the live challenge seed in `game.js` still grants `80`. Challenge completion combat text also still shows a generic `挑战完成 +金币`, so runtime feedback does not expose the actual reward short label that the sidebar already uses.

**Approaches**

1. Update only the seeded reward amount.
   This removes the numeric drift, but the completion toast stays vague and future explicit `rewardLabel` values would still not surface in gameplay feedback.

2. Update the seeded reward and hardcode `挑战完成 +90金` in the completion toast.
   This fixes the current baseline, but reintroduces duplication if future challenges switch to explicit `rewardLabel` copy.

3. Recommended: update the seeded reward to `90`, then build completion feedback from the same shared reward short-label helper used by sidebar summaries and badges.
   This keeps one source of truth for reward copy, fixes the current numeric mismatch, and preserves future `rewardLabel` extensibility with the smallest code change.

**Chosen Design**

- Keep the current single challenge shape and only align its live `rewardGold` value from `80` to `90`.
- Reuse `formatRunChallengeRewardShortLabel` to generate a completion reward suffix for combat text, falling back to the generic `挑战完成` only if no reward label exists.
- Add regression checks for the seeded challenge reward baseline and for the completion feedback helper/path so runtime copy cannot drift from the documented sidebar copy again.
