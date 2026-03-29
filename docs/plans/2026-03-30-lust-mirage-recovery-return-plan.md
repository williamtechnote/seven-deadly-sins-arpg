# Lust Mirage Recovery Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3 `mirageDance` recovery again after the longer shared `majorSpecial` recovery and loopback bridge so the next `reverseControl` re-entry breathes a little longer.

**Architecture:** Reuse the existing `mirageDance` executor recovery hook in `game.js`, then lock the new timing contract with regression assertions and matching README wording. Keep the change narrow to pacing constants, docs, and heartbeat tracking.

**Tech Stack:** Phaser 3 runtime, plain JavaScript, Node CLI regression checks

---

### Task 1: Lock the new mirage recovery contract

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Update the `mirageDance` finisher recovery expectation to the new value.
- Update the README regex assertion to expect the new post-shared-recovery mirage spacing wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new `mirageDance` recovery contract and README wording.

**Step 3: Write minimal implementation**

- Raise `this.attackData.finisherRecoveryMs` in the `mirageDance` branch in `game.js`.
- Update the Lust phase-3 pacing paragraph in `README.md`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update task tracking**

- Mark the `mirageDance` recovery return item complete.
- Promote the next observation as the only active TODO.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Integrate**

- Commit on the current branch if local branch creation is still blocked by sandbox lock files.
- Attempt local merge to `main`.
- If local branch/merge operations fail again, push `HEAD` to `feat/auto-lust-mirage-recovery-return` and `main` after verifying `origin/main` is an ancestor.
