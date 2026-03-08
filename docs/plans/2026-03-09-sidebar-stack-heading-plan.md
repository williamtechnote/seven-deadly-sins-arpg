# Sidebar Stack Heading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the fixed right-sidebar measurement flow to cover section headings and dynamic vertical stacking for future long copy.

**Architecture:** Reuse `UIScene`'s existing hidden sidebar measurement nodes for heading fitting, add one pure layout helper in `shared/game-core.js` for deterministic sidebar stacking, and let `UIScene` reposition the fixed right-sidebar blocks from measured text heights instead of fixed offsets.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node regression script

---

### Task 1: Sidebar heading measured fitting

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add a regression assertion proving `UIScene` routes the fixed sidebar section heading through `_fitHudSidebarTextLine(..., 'sidebarSectionTitle')`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `runModifierTitle` is still assigned a raw string and the docs only talk about summaries.

**Step 3: Write minimal implementation**

Add a `sidebarSectionTitle` measurement style and route the current sidebar section heading through the existing single-line measured fitter.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new heading-fitting assertion.

### Task 2: Sidebar vertical stacking helper

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add one pure regression test for the stacking helper output and one source-hook assertion proving `UIScene` now reflows the sidebar blocks from measured heights.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because no stacking helper exists and the sidebar still uses fixed Y offsets.

**Step 3: Write minimal implementation**

Add a small exported helper that computes stacked Y positions from block heights/gaps, then call it from `UIScene` after sidebar texts are updated.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper and source-hook assertions.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Replace the broad evaluation item with three concrete follow-ups, mark the first two complete, and leave the narrow-viewport evaluation item active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use the requested branch name `feat/auto-sidebar-stack-heading`; if local branch creation still fails with the ref-lock permission error, preserve that branch name by pushing `HEAD` to the remote ref after merge.

**Step 4: Append audit**

Record the implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
