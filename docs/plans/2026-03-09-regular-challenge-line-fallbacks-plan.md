# Regular Challenge Line Fallbacks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve readable regular three-line challenge summaries under tighter width budgets by adding semantic fallbacks for the third progress/reward line.

**Architecture:** Extend the shared challenge sidebar helper in `shared/game-core.js` so regular summaries pick among measured third-line variants instead of emitting a single fixed string. Prove the change through regression checks, then sync the README and in-game help text to the same fallback chain.

**Tech Stack:** JavaScript, Phaser 3, shared browser/CLI helpers, Node-based regression checks

---

### Task 1: Split TODO and capture the design

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-regular-challenge-line-fallbacks-design.md`

**Step 1: Update the active TODO list**

Promote three concrete regular-summary fallback tasks from the current challenge/sidebar text-budget area.

**Step 2: Save the design note**

Record the semantic third-line fallback approach and why it is preferred over collapsing regular mode earlier.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing tests**

Add assertions for:
- regular in-progress third line: `进度:12/30  奖励:+90金 -> 进度:12/30 -> 12/30`
- regular completed third line: `进度:30/30  奖励:+90金 -> 进度:30/30 -> 30/30`
- a future compound reward using `rewardLabel: '+9999金 +净化'` to confirm the same chain

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new regular-summary assertions because the helper still emits a single fixed third line today.

### Task 3: Implement the minimal helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add a regular third-line variant helper and use `pickChallengeLabelVariant` when building regular challenge summaries.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new regular-summary assertions.

### Task 4: Sync docs/help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update user-facing docs**

Document the regular third-line chain for both in-progress and completed states, including future compound reward labels.

**Step 2: Re-run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS
