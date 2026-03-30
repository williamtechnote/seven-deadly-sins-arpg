# Lust Cadence Recovery Inline Snapshot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Inline the Lust phase 3 shared-recovery snapshot short note into each markdown cadence checkpoint so live pacing review no longer needs to open JSON for the key recovery values.

**Architecture:** Tighten the existing markdown regression assertion first, then add one small formatter in `scripts/e2e-report.mjs` that appends a compact recovery snapshot note beside the existing expected-return note and artifact anchors.

**Tech Stack:** JavaScript, Node.js

---

### Task 1: Add the failing regression expectation

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Require the markdown report checkpoint line to include a recovery snapshot short note with:
- `sharedRecoveryRemainingMs`
- `breatherRemaining`
- `expectedReturnLabel`

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: FAIL on the updated report assertion because the formatter does not yet inline the recovery snapshot note.

### Task 2: Implement the formatter change

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add a helper that compresses the snapshot into a short markdown note and append it to each checkpoint line.

**Step 2: Re-run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Sync docs and backlog

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that the markdown report now inlines recovery snapshot short notes.

**Step 2: Update heartbeat records**

Mark TODO item 一百零五 complete, add the next active follow-up, and append the mandatory audit line with the git blocker status if commit/merge/push remain blocked.
