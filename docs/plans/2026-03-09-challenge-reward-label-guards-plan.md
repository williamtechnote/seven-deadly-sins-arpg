# Challenge Reward Label Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add regression coverage and a shared reward-label helper so ultra-compact challenge summaries keep the same fallback chain for `+9999金` and future compound reward short labels.

**Architecture:** Keep `buildRunChallengeSidebarLines` and badge helpers as the width-budget decision points. Add one inline reward-label formatter that accepts either the current gold reward data or an optional future `rewardLabel`, then reuse it in the ultra-compact summary/badge variants and thread the optional field through `GameState` challenge summaries.

**Tech Stack:** Plain JavaScript, Phaser runtime state in `game.js`, shared logic in `shared/game-core.js`, Node CLI regression checks in `scripts/regression-checks.mjs`

---

### Task 1: Guard Extra-Large Gold Reward Fallbacks

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`

**Step 1: Write the failing test**

Add regression assertions that `rewardGold: 9999` still follows:
- `挑战 12/30 · +9999金 -> 挑战 12/30 -> 12/30`
- `挑战完成 · +9999金 -> 挑战完成 -> 完成`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL until the new guard expectations and docs are aligned.

**Step 3: Write minimal implementation**

Update README wording so the documented visible-summary ladder explicitly covers `+9999金`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Add Shared Reward Short-Label Hook

**Files:**
- Modify: `game.js`
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`

**Step 1: Write the failing test**

Add regression assertions that an explicit reward short label like `+9999金 +净化`:
- renders as the first ultra-compact visible-summary variant when width allows
- still falls back to `挑战 12/30` / `挑战完成` once width tightens

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because current helpers only read `rewardGold`

**Step 3: Write minimal implementation**

Add `formatRunChallengeRewardShortLabel`, reuse it in ultra-compact summary/badge helpers, and propagate optional `rewardLabel` through runtime challenge summaries.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
