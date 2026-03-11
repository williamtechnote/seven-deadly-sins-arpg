# Lust Recovery Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend `魅惑女妖` phase-3 `reverseControl` and `illusion` recovery windows one more step, then leave a concrete fallback TODO for any remaining breather escalation.

**Architecture:** Keep runtime tuning inside the existing special executor branches in `game.js`, lock the behavior with source-hook regressions in `scripts/regression-checks.mjs`, and synchronize the pacing contract in `README.md` and `TODO.md`.

**Tech Stack:** Phaser 3, plain JavaScript, CLI regression checks

---

### Task 1: Lock the next `reverseControl` recovery extension

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Update the `reverseControl` recovery assertion so it requires a larger `recoveryMs` value than the current baseline.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `reverseControl` recovery assertion.

**Step 3: Write minimal implementation**

Increase `reverseControl` recovery without changing projectile behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the `reverseControl` recovery assertion.

### Task 2: Lock the next `illusion` recovery extension

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Update the `illusion` recovery assertion so it requires a larger `recoveryMs` value than the current baseline.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `illusion` recovery assertion.

**Step 3: Write minimal implementation**

Increase `illusion` recovery and sync the README wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the `illusion` recovery assertion and README wording.

### Task 3: Keep the backlog concrete

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Split the observation**

Replace the single active observation with ordered executor-level recovery tasks plus one remaining fallback observation.

**Step 2: Leave one next item active**

After implementing the first two tasks, mark them complete and leave only the fallback observation active.
