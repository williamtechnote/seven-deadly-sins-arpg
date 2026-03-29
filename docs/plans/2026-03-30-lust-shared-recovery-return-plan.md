# Lust Shared Recovery Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3 shared `majorSpecial` recovery again after the longer `mirageDance -> reverseControl` bridge so the next major-special cycle leaves a clearer breather.

**Architecture:** Reuse the existing phase-level `sharedAttackRecoveryMs.majorSpecial` hook in `data.js`, then lock the new contract with regression assertions and matching README wording. Keep the change narrow to pacing metadata and docs rather than adding new selector logic.

**Tech Stack:** Phaser 3 runtime, plain JavaScript, Node CLI regression checks

---

### Task 1: Lock the new shared-recovery contract

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Update the Lust shared-recovery expectation to the new `majorSpecial` recovery value.
- Update the README regex assertion to expect the new post-loopback shared-recovery wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new Lust shared-recovery contract and README wording.

**Step 3: Write minimal implementation**

- Raise `BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial` in `data.js`.
- Update the Lust phase-3 pacing paragraph in `README.md`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update task tracking**

- Mark the shared-recovery return item complete.
- Promote the next observation as the only active TODO.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Integrate**

- Commit on the current branch if local branch creation is still blocked by sandbox lock files.
- Attempt local merge to `main`.
- If local branch/merge operations fail again, push `HEAD` to `feat/auto-lust-shared-recovery-return` and `main` after verifying `origin/main` is an ancestor.
