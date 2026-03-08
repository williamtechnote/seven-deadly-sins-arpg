# Measured HUD Clamps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Phaser-backed text measurement to the next two longest HUD surfaces: event-room shrine world labels and Boss telegraph copy.

**Architecture:** Put the reusable fitting logic in `shared/game-core.js`, cover it in `scripts/regression-checks.mjs`, and keep `game.js` responsible only for measuring Phaser text widths, caching them, and applying the fitted text/positions. Preserve the remaining side-panel evaluation as a follow-up item instead of widening scope.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Event-room world-label fitting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression coverage for a centered viewport clamp helper and a measured ellipsis helper, plus source-hook checks showing `LevelScene` measures and clamps the world label rather than only the short prompt.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new helpers and scene wiring do not exist yet.

**Step 3: Write minimal implementation**

Add the shared helpers, then update `LevelScene` so the shrine world label uses cached Phaser measurements for both width fitting and centered viewport placement.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new world-label coverage.

### Task 2: Boss telegraph measured fitting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add regression coverage proving long Boss telegraph labels can be truncated against measured widths while preserving short labels unchanged, plus source-hook checks for Phaser-backed measurement in `BossScene`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared fitting helper is not applied to Boss HUD copy yet.

**Step 3: Write minimal implementation**

Measure the title/window/hint text with cached Phaser nodes, fit them to the Boss HUD lane widths, and keep the existing copy structure when text already fits.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new Boss HUD coverage.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two subtasks complete and leave the fixed-side-panel evaluation item active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-measured-hud-clamps` if local refs permit creation; otherwise record the local ref-lock blocker and preserve the branch name by pushing `HEAD` to that remote ref after merge.

**Step 4: Append audit**

Record the implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
