# ARPG Upgrade Feedback Contract

This note narrows the repo's broader reward-feedback work to one system: forge upgrades. The goal is simple: every upgrade should answer `升了什么` and `花了什么` without forcing the player to reopen another panel or remember the pre-click state.

## Why this matters

- Action-game feedback works best when it is immediate and specific.
- Decision-support UI should spell out the consequence of an action instead of making the player infer hidden rules.
- Extrinsic rewards stay motivating when the next improvement is visible and close at hand, not buried behind one large final payoff.

For this repo, that means a forge success line should preserve a small ladder of anchors:

1. success conclusion
2. level transition
3. current-step payoff
4. cumulative weapon state
5. spend/material anchor

If width gets tight, the ladder should compress from the tail, but it should not drop `花了什么` before at least one cumulative anchor has had a chance to survive in a compact form.

## Practical rules

### 1. Keep the first two answers in the same line

The player should not need one surface for `Lv.2→Lv.3` and another for `消耗2个暴怒`. When possible, keep the upgrade result and the spend anchor in one receipt.

### 2. Compress labels before deleting meanings

Prefer:

- `累计+9 / 特攻-0.3s · 消耗2个暴怒`
- `累计伤害+9 · 消耗2个暴怒`

Before:

- removing the spend anchor entirely
- removing all cumulative state and leaving only this-step payoff

### 3. Preserve explanation order

When the line must shrink, preserve:

1. `强化成功!`
2. `Lv.X→Lv.Y`
3. one current-step payoff segment
4. one cumulative segment
5. a compact spend anchor

Only after that should the helper fall back to the older payoff-only ladder.

### 4. Share one contract across code, docs, and tests

Forge copy is easy to drift because it appears in shared helpers, scene glue, README text, help overlay text, and regression checks. The shared helper owns the ladder; all other surfaces should describe or consume that same ladder.

## Suggested heartbeat heuristic

Upgrade-feedback TODOs are high ROI when they:

- reduce post-click guesswork in under one second
- reuse existing forge surfaces instead of adding new HUD
- can be locked with deterministic width-based regression tests

## Source notes

Synthesized from:

- Game Developer, "Using feedback as a teacher in video games" (2021): https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
- Game Developer, "Feedback in games - how to design rewards and punishments?" (2022): https://www.gamedeveloper.com/game-platforms/feedback-in-games-how-to-design-rewards-and-punishments
- Game Developer, "Rewarding Difficulty in Game Design: Intrinsic vs. Extrinsic" (2014): https://www.gamedeveloper.com/design/rewarding-difficulty-in-game-design-intrinsic-vs-extrinsic
