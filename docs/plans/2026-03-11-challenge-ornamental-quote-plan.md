# Challenge Ornamental Quote Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run-challenge label cleanup to cover the next two unsupported ornamental quote decorator families while leaving one adjacent family active in TODO.

**Architecture:** Reuse the existing shared decorator-pair table in `shared/game-core.js` so all runtime and CLI summary surfaces inherit the same cleanup behavior. Lock support with regression tests before the implementation change, then sync README/help text to the expanded wrapper list.

**Tech Stack:** Plain JavaScript, Phaser 3 UI/help copy, Node regression script

---

### Task 1: Add failing regression coverage for the first two Active TODO items

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `〝挑战〞击败 30 个敌人` and `〝本局挑战〞挑战：本局`
- `〝挑战〟击败 30 个敌人` and `〝本局挑战〟挑战：本局`
- README/help copy mentioning both new wrapper families

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new unsupported wrapper assertions

### Task 2: Implement shared sanitizer support

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Append the new ornamental quote pairs to `RUN_CHALLENGE_DECORATOR_PAIRS`.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs/help copy and TODO bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Add both new wrapper families to the grouped decorator-copy strings in README/help overlay.

**Step 2: Mark completed TODOs and leave the third item active**

Move the first two Active items to Completed with timestamps, preserving `〘…〙` support as the next Active task.

### Task 4: Verify and finish git flow with fallback

**Files:**
- No source changes

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt branch/merge/push flow**

- Try local branch creation and normal commit/merge/push
- If ref-lock restrictions persist, commit on the current branch, push `HEAD` to `refs/heads/feat/auto-challenge-ornamental-quotes`, and record the blocker in `PROGRESS.log`
