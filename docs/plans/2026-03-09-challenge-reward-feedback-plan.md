# Challenge Reward Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the live run-challenge reward with the documented `+90金` baseline and show the exact reward short label in completion combat feedback.

**Architecture:** Keep the existing single challenge definition in `game.js`, route reward copy through the shared helper in `shared/game-core.js`, and lock the behavior with regression guards that cover both the seeded runtime reward and the completion feedback label.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Seed the failing reward-alignment checks

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that the live challenge seed resolves to `rewardGold: 90` and that the completion feedback path surfaces `挑战完成 +90金` for the default challenge while still honoring explicit `rewardLabel`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the seeded challenge reward and/or completion feedback string assertions.

### Task 2: Implement the minimal reward source-of-truth changes

**Files:**
- Modify: `game.js`
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Change the seeded `enemySlayer` challenge reward from `80` to `90`.
- Add a small shared helper for challenge completion feedback text that reuses `formatRunChallengeRewardShortLabel`.
- Use that helper where combat text is emitted on challenge completion.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new reward-alignment checks.

### Task 3: Sync docs and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that challenge completion feedback now surfaces the same exact reward short label used by sidebar summaries.

**Step 2: Finish the heartbeat**

Run the required syntax/regression command chain, then append the audit line with branch fallback, test result, merge status, push status, and blocker detail.
