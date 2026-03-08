# Sidebar Affix And Area Clamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the fixed right-sidebar Phaser measurement flow to the next two concrete paths: run modifier lines and the area-name heading.

**Architecture:** Reuse `UIScene`'s existing hidden sidebar text measurement infrastructure. First add failing source-hook tests for the run-modifier and area-name paths, then minimally wire those texts through measured clamp helpers, and finally update docs/TODO/progress logging while leaving one follow-up evaluation item active.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node regression script

---

### Task 1: Run modifier sidebar measured fitting

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add a regression assertion proving `UIScene` routes `runModifierText` lines through `_fitHudSidebarTextLines(..., 'runModifierSidebar')`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the run-modifier sidebar still writes raw joined lines.

**Step 3: Write minimal implementation**

Add a `runModifierSidebar` measure style and set the sidebar text from the measured line fitter.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new run-modifier sidebar assertion.

### Task 2: Area-name sidebar measured fitting

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add a regression assertion proving `UIScene` routes `areaNameText` through a measured single-line fitter, then extend docs expectations for the broader sidebar coverage.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the area name is still assigned raw and the docs only mention challenge/event-room coverage.

**Step 3: Write minimal implementation**

Add a single-line sidebar fitting helper, wire the area name through it, and update README/help copy to mention run modifiers and area names.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new area-name and docs assertions.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the run-modifier and area-name items complete, and leave the follow-up evaluation item active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Try to preserve `feat/auto-sidebar-affix-area-clamp`; if local branch creation stays blocked by ref-lock permissions, push `HEAD` to that remote ref and record the fallback.

**Step 4: Append audit**

Record implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
