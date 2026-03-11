# Lust Special Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add explicit post-attack recovery windows to Lust phase-3 `reverseControl` and `illusion`, then leave one concrete follow-up TODO for any remaining breather guard work.

**Architecture:** Keep the work inside the existing Lust special executor branches and the lightweight regression suite. Do not refactor the selector unless the remaining follow-up is reached later.

**Tech Stack:** Phaser 3, plain JavaScript, source-hook CLI regressions

---

### Task 1: Lock reverseControl recovery with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that the `reverseControl` branch:
- defines a `recoveryMs` constant
- destroys projectiles before finishing
- waits until `1400 + recoveryMs` to call `_finishAttack`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new `reverseControl` recovery assertions.

**Step 3: Write minimal implementation**

Update the `reverseControl` executor in `game.js` to keep the boss in attack state for a short post-collapse recovery window.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `reverseControl` assertions.

### Task 2: Lock illusion recovery with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add assertions that the `illusion` branch:
- defines a `recoveryMs` constant
- restores the boss alpha and clears illusions before finishing
- waits until `3000 + recoveryMs` to call `_finishAttack`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new `illusion` recovery assertions.

**Step 3: Write minimal implementation**

Add the short `illusion` recovery window, then sync README and TODO wording to the new pacing contract.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `illusion` assertions and doc wording.

### Task 3: Keep the next observation item concrete

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Rewrite the backlog**

Replace the single active observation item with three ordered entries:
- reverseControl recovery
- illusion recovery
- a remaining breather-guard fallback item

**Step 2: Leave the third item active**

After implementing the first two tasks, mark them complete and leave the breather-guard fallback as the only active follow-up.
