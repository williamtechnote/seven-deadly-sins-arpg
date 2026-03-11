# Lust Recovery Spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend `魅惑女妖` phase-3 `reverseControl` and `illusion` recovery windows again, then leave one concrete follow-up TODO for any remaining bridge work.

**Architecture:** Keep the runtime changes inside the existing boss attack executor branches in `game.js`, and lock the new pacing contract with the lightweight source-hook regression suite plus README/TODO updates.

**Tech Stack:** Phaser 3, plain JavaScript, CLI regression checks

---

### Task 1: Lock the next `reverseControl` recovery extension

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Update the recovery assertion in `scripts/regression-checks.mjs` so `reverseControl` must define a longer `recoveryMs` value than the current pass.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `reverseControl` recovery assertion.

**Step 3: Write minimal implementation**

Increase `reverseControl` recovery in `game.js` without changing its projectile behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the `reverseControl` recovery assertion.

### Task 2: Lock the next `illusion` recovery extension

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Update the recovery assertion in `scripts/regression-checks.mjs` so `illusion` must define a longer `recoveryMs` value than the current pass.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `illusion` recovery assertion.

**Step 3: Write minimal implementation**

Increase `illusion` recovery in `game.js`, then sync README wording to the new pacing pass.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the `illusion` recovery assertion and README wording.

### Task 3: Keep the backlog concrete

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Split the active observation**

Replace the single active observation with ordered recovery tasks plus one remaining fallback observation.

**Step 2: Leave one next item active**

After implementing the first two tasks, mark them complete and keep only the bridge/recovery fallback observation active.
