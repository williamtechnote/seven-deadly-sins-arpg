# Lust Illusion Recovery Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3 `illusion` recovery one more step so `mirageDance` returns later after the current `reverseControl` / shared-recovery / loopback pacing passes.

**Architecture:** Keep the change narrow. Lock the stronger `illusion` recovery expectation in `scripts/regression-checks.mjs` first, then update the executor timing in `game.js`, the player-facing pacing contract in `README.md`, and the backlog state in `TODO.md`.

**Tech Stack:** Plain JavaScript, Phaser 3, Node regression script

---

### Task 1: Split the active observation into an implementation item and a remaining follow-up

**Files:**
- Create: `docs/plans/2026-03-30-lust-illusion-recovery-return-design.md`
- Modify: `TODO.md`

**Step 1: Write the backlog split**

Replace active observation `八十一` with concrete item `八十二` and remaining observation `八十三`.

**Step 2: Verify ordering**

Confirm `八十二` is the only item implemented in this cycle and `八十三` stays active afterward.

### Task 2: Lock the longer `illusion` recovery with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`

**Step 1: Write the failing test**

Raise the expected `illusion` recovery constant and tighten the README pacing sentence to include the newest follow-up context.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `illusion` recovery contract until source/docs are updated.

### Task 3: Write the minimal implementation

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Update runtime tuning**

Increase the `illusion` recovery constant by one 120ms step.

**Step 2: Sync docs**

Update the README sentence so it describes the latest prerequisite chain and late `mirageDance` return.

**Step 3: Run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Close the item and audit the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completion**

Move `八十二` to completed with timestamp and keep `八十三` active.

**Step 2: Record audit**

Append the heartbeat audit line with branch fallback, verification result, merge status, push status, and blockers if any.
