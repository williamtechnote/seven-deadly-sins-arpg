# Telegraph Head Edge Soften Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Soften the Boss telegraph countdown head shell/core seam during the final sub-millisecond endpoint beat.

**Architecture:** Add one shared telegraph-summary flag for the existing final width-trim state, then let the Phaser renderer switch the shell/core geometry to slightly softer subpixel placement when that flag is active. Timing thresholds and overall telegraph layout remain unchanged.

**Tech Stack:** JavaScript, Phaser 3, Node-based regression checks

---

### Task 1: Lock the behavior in tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that the final sub-millisecond telegraph summary exposes `currentCountdownHeadMarkerShellCoreEdgeSoftened`, that the Boss telegraph renderer consumes that flag when computing the countdown-head shell/core seam geometry, and that README/help copy documents the change.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new flag and rendering/documentation hooks do not exist yet.

### Task 2: Implement the shared flag and rendering hook

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the new shared-summary field next to the existing final-width-trim convergence flags, then update the countdown-head shell/core geometry so the final seam uses softer subpixel placement when the flag is active.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and audit trail

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Mark the implemented TODO item complete, seed the next active heartbeat item, and describe the new edge-soften endpoint polish in the README/help copy.

**Step 2: Final verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
