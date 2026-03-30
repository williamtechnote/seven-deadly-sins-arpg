# Telegraph Head Edge Balance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Balance the final sub-millisecond countdown-head shell/core edge highlight so the telegraph endpoint no longer looks thicker on one side during the last beat.

**Architecture:** Extend the shared telegraph summary with one more final-beat contract flag, then consume that flag in BossScene countdown-head rendering to rebalance the shell/core geometry. Keep the change small and sync the README, help overlay, TODO queue, and regression checks to the same contract.

**Tech Stack:** Phaser 3, plain JavaScript, shared game-core summary helpers, CLI regression checks

---

### Task 1: Lock the new regression contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for a new `currentCountdownHeadMarkerShellCoreEdgeHighlightThicknessBalanced` summary flag, a rendering-source hook that uses it to rebalance countdown-head shell/core geometry, and README/help-overlay copy for the player-facing description.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing summary/rendering/docs contract.

### Task 2: Implement the shared-summary and rendering change

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the new summary flag for the final sub-millisecond beat and use it in BossScene countdown-head shell/core geometry so the final edge highlight becomes laterally balanced.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and queue

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new telegraph polish line in the README and in the help-overlay copy path, then mark the current TODO item completed and keep one follow-up active.

**Step 2: Run required full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Deliver the cycle

**Files:**
- Modify: git history / refs

**Step 1: Commit**

Create one commit for the feature work and one commit for the mandatory audit line if needed by the repo’s heartbeat convention.

**Step 2: Merge and push**

Attempt local branch + merge flow first. If sandboxed git lock creation blocks local ref updates, use the existing remote-fast-forward fallback while preserving the requested `feat/auto-*` branch.
