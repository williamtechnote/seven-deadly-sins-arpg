# Lust Loopback Bridge Follow-Up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase 3 so `mirageDance` hands back to `reverseControl` through one more directed light-pressure pair.

**Architecture:** Keep the current phase-3 pacing system intact and adjust only the attack list contract plus its regression coverage. Mirror the new bridge length in the README so docs and assertions stay aligned.

**Tech Stack:** JavaScript, Phaser 3 data config, Node regression checks

---

### Task 1: Lock the new loopback contract in tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Raise the expected `mirageDance -> reverseControl` bridge length from 18 to 20 attacks and update the README regex to expect the stronger wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the Lust loopback bridge assertions.

**Step 3: Write minimal implementation**

No production change in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the data and README still describe the old bridge length.

### Task 2: Implement the longer loopback bridge

**Files:**
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write minimal implementation**

Append one extra `dash`, `charmBolt` pair after `mirageDance` in Lust phase 3 and update the README/TODO wording to match.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Verify repo checks and audit trail

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Record audit**

Append the mandatory heartbeat audit line with branch, task, verification, and merge/push status.
