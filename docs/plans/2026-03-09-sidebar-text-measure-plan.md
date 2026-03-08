# Sidebar Text Measure Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Phaser-backed text measurement to the two highest-priority fixed right-sidebar paths: run challenge summary and event-room HUD summary.

**Architecture:** Add a reusable multi-line width clamp helper in `shared/game-core.js`, cover it in `scripts/regression-checks.mjs`, and let `UIScene` provide hidden Phaser text measurement nodes plus caches for the challenge and event-room sidebar styles. Keep the remaining side-panel evaluation item active instead of widening scope.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Challenge sidebar measured fitting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression coverage for a shared multi-line clamp helper and a source-hook check showing `UIScene` routes the challenge sidebar through a Phaser-backed measurement helper.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper and `UIScene` wiring do not exist yet.

**Step 3: Write minimal implementation**

Add the helper, then update `UIScene` so the challenge summary is built as lines and each line is fitted against the fixed sidebar width with cached Phaser measurements.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new challenge-sidebar coverage.

### Task 2: Event-room sidebar measured fitting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add source-hook checks showing the event-room sidebar also routes its generated HUD lines through the shared measured-fitting path, and extend docs expectations for the new measured sidebar behavior.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `UIScene` still relies on static wrap for event-room sidebar text and docs do not mention the measured clamp.

**Step 3: Write minimal implementation**

Measure the event-room lines with cached Phaser nodes, clamp each line to the side-panel width, and document the behavior in README/help text.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new event-room sidebar coverage.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two subtasks complete and leave the remaining fixed-sidebar evaluation item active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-sidebar-text-measure` if local refs permit creation; otherwise record the local ref-lock blocker and preserve the branch name by pushing `HEAD` to that remote ref after merge.

**Step 4: Append audit**

Record the implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
