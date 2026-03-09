# Challenge Invalid-Target State Helper Design

**Context**

`shared/game-core.js` already renders the visible invalid-target challenge summaries correctly, but the no-reward behavior is still inferred indirectly from empty `progressLabel` branches spread across regular, compact, and ultra-compact helpers. `TODO.md` still has one active challenge-summary follow-up, so this heartbeat should split it into explicit tasks and harden the first two.

**Approaches**

1. Docs + tests only
   Keep the current helper structure and just add regression coverage plus README/help text.
   Trade-off: behavior is locked, but the invalid-target visible state fallback remains implicit.

2. Extract shared invalid-target state helpers for the no-reward path
   Add tiny helpers that encode the visible `进行中` / `已完成` fallback ladders and reuse them from regular, compact, and ultra-compact formatting.
   Trade-off: small refactor, but it makes the intent explicit and reduces future drift.

3. Fully unify reward-bearing and rewardless invalid-target helpers in one pass
   Move every invalid-target visible variant behind one helper layer.
   Trade-off: wider change than this heartbeat needs and overlaps with the next pending TODO item.

**Recommendation**

Take approach 2. It is the smallest change that turns the visible no-reward invalid-target behavior into explicit shared code, while leaving the reward-bearing follow-up for the next cycle.

**Scope**

- Implement the first two active TODO items:
  - in-progress invalid-target no-reward shared state helper + regressions
  - completed invalid-target no-reward shared state helper + regressions
- Sync `README.md` and the in-game help overlay text in `game.js`
- Leave the reward-bearing invalid-target helper unification active for a later heartbeat
