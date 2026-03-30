# Telegraph Head Edge Brightness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Balance the final sub-millisecond countdown-head shell/core edge highlight brightness so the telegraph endpoint stops looking brighter on one side during the last tail beat.

**Architecture:** Extend the shared telegraph summary with one more final-beat boolean contract, then consume that flag in BossScene countdown-head rendering to rebalance shell/core highlight brightness without changing the broader telegraph flow. Keep README/help-overlay text, TODO state, and regression checks aligned to the same contract.

**Tech Stack:** Phaser 3, plain JavaScript, shared game-core helpers, CLI regression checks

---

### Task 1: Lock the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for a new `currentCountdownHeadMarkerShellCoreEdgeHighlightBrightnessBalanced` shared-summary flag, its BossScene rendering usage, and the synced README/help-overlay wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing summary/rendering/docs contract.

### Task 2: Implement the shared-summary and rendering change

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Expose the new final-beat brightness-balance flag and use it to slightly converge countdown-head shell/core highlight brightness in the last sub-millisecond frame.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and queue

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Mark the current TODO item completed, keep one new follow-up item active, and document the new brightness-balance polish line in both the README and help-overlay copy path.

**Step 2: Run required full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Deliver the heartbeat cycle

**Files:**
- Modify: git history / refs

**Step 1: Commit**

Commit the feature work and append the mandatory audit line before the final push attempt.

**Step 2: Merge and push**

Attempt the requested `feat/auto-*` branch flow first. If local git ref locks remain sandbox-blocked, preserve the feature branch by pushing `HEAD` to the requested remote branch and continue with the existing direct-on-`main` fallback used by this repo.
