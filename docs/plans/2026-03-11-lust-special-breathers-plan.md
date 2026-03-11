# Lust Special Breathers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add post-attack breather guards to Lust phase-3 `reverseControl` and `illusion`, then leave one concrete observation TODO if pacing still needs another pass.

**Architecture:** Reuse the existing generic `postAttackBreatherGuards` selector hook. Add failing regression assertions first, then update Lust phase 3 metadata plus README/TODO wording without changing the broader selector behavior.

**Tech Stack:** Phaser 3, plain JavaScript, source-hook CLI regressions

---

### Task 1: Lock the `reverseControl` breather guard with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that `BOSSES.lust.phases[2].postAttackBreatherGuards.reverseControl` exists and blocks `reverseControl`, `illusion`, and `mirageDance`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing `reverseControl` breather metadata.

**Step 3: Write minimal implementation**

Add the `reverseControl` guard entry in `data.js` and keep the selector logic unchanged.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `reverseControl` guard assertion.

### Task 2: Lock the `illusion` breather guard with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add assertions that `BOSSES.lust.phases[2].postAttackBreatherGuards.illusion` exists and blocks `reverseControl`, `illusion`, and `mirageDance`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing `illusion` breather metadata and doc wording.

**Step 3: Write minimal implementation**

Add the `illusion` guard entry, then sync README/TODO language to describe the new phase-3 spacing contract.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `illusion` assertions and doc wording.

### Task 3: Keep the last follow-up explicit

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Rewrite the backlog**

Replace the prior single observation item with three ordered entries:
- `reverseControl` breather guard
- `illusion` breather guard
- one remaining observation item

**Step 2: Leave only the third item active**

After implementation, mark the first two items complete and keep the final observation item as the sole active follow-up.
