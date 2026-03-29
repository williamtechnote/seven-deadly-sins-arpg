# Lust Illusion Recovery Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Widen `魅惑女妖` phase 3's `illusion` post-despawn recovery so the next major handoff lands later and reads more cleanly for the player.

**Architecture:** Keep the change executor-level. Update the regression contract first, then raise the `illusion` recovery constant in `game.js`, sync `README.md`, and close the active TODO item after verification.

**Tech Stack:** Plain JavaScript, Phaser 3, Node regression script

---

### Task 1: Promote the concrete pacing item

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-29-lust-illusion-recovery-return-design.md`
- Create: `docs/plans/2026-03-29-lust-illusion-recovery-return-plan.md`

**Step 1: Update the backlog**

Add a concrete active TODO item for the `illusion` recovery pass ahead of the existing observation.

**Step 2: Preserve scope**

Keep the older observation item active as the fallback follow-up rather than inventing a second gameplay change.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Tighten the recovery expectation**

Raise the expected `illusion` recovery constant and README wording contract.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new `illusion` recovery contract until code/docs are updated.

### Task 3: Implement the minimal pacing change

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Raise the recovery window**

Increase the `illusion` recovery constant only.

**Step 2: Sync the docs**

Update the phase-3 pacing description to mention the later `reverseControl` / `mirageDance` handoff after `illusion`.

**Step 3: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Close the loop

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the implemented item done**

Record completion time in `TODO.md`.

**Step 2: Append audit**

Add the mandatory `PROGRESS.log` line with task, branch, verification, merge/push outcome, and any blocker/fallback.
