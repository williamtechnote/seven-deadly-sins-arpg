# Lust Shared Recovery Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the remaining Lust phase-3 pacing observation into three concrete TODO items, then implement the first two by extending shared recovery and the `reverseControl` recovery window.

**Architecture:** Keep the change narrow. Lock the new shared-recovery and `reverseControl`-recovery expectations in `scripts/regression-checks.mjs` first, then update the phase metadata in `data.js`, the executor timing in `game.js`, and the player-facing wording in `README.md` / `TODO.md`.

**Tech Stack:** Plain JavaScript, Phaser 3, Node regression script

---

### Task 1: Split the active observation into ordered follow-ups

**Files:**
- Create: `docs/plans/2026-03-11-lust-shared-recovery-return-design.md`
- Modify: `TODO.md`

**Step 1: Write the backlog split**

Replace the single `二十五-三` active observation with `二十六-一 / 二十六-二 / 二十六-三`.

**Step 2: Verify ordering**

Confirm the first two active items are shared recovery and `reverseControl` recovery.

### Task 2: Lock the stronger shared recovery guard with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Raise the expected Lust phase-3 `sharedAttackRecoveryMs.majorSpecial` value and tighten the README wording for the newer shared-recovery pause.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the shared-recovery contract until source/docs are updated.

**Step 3: Write minimal implementation**

Increase the shared recovery value in `data.js` and sync the README sentence.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the shared-recovery checks.

### Task 3: Lock the longer `reverseControl` recovery with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Raise the expected `reverseControl` recovery constant and README wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `reverseControl` recovery contract until the executor and docs are updated.

**Step 3: Write minimal implementation**

Increase `reverseControl` recovery in `game.js` and sync the README sentence.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated `reverseControl` recovery checks.

### Task 4: Close the first two TODO items and leave the final observation queued

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO state**

Mark `二十六-一 / 二十六-二` complete with timestamps and leave `二十六-三` active.

**Step 2: Audit the run**

Append the required dev-cycle line to `PROGRESS.log` with branch fallback, verification, blockers, and merge/push outcome.
