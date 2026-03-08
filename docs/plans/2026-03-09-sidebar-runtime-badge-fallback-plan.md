# Sidebar Runtime Badge Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the sidebar’s tighter compact tiers reachable at runtime and add a final completed-badge silent fallback so the shared `本局词缀` heading stays stable under the narrowest budgets.

**Architecture:** Add a shared sidebar display-metrics helper that derives tier and effective width budget from the actual displayed game size, then consume it in `UIScene` for tier and badge layout decisions. Extend the challenge badge helper so completed badges disappear once even `完成` exceeds the current max badge width, and lock both behaviors with regression checks plus doc updates.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Runtime-reachable sidebar tiers

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression coverage for a shared helper that derives sidebar tier and effective width budget from actual display size, plus a source-hook proving `UIScene` reads display-size-backed sidebar metrics instead of raw camera dimensions.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper does not exist and `UIScene` still keys sidebar responsiveness off fixed logical canvas size.

**Step 3: Write minimal implementation**

Add the shared helper, export it, import it in `game.js`, and route `_getHudSidebarViewportTier` / `_getHudSidebarMaxWidth` through actual display-size-backed metrics.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for runtime-reachable sidebar tier and budget coverage.

### Task 2: Completed badge silent fallback

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Extend challenge badge regression coverage to assert that a completed badge returns empty once even `完成` exceeds the current max badge width, and add README/help checks for that final fallback.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because completed badges still force `完成` even when the width budget is below the minimum readable threshold.

**Step 3: Write minimal implementation**

Update the shared badge picker to allow a completed-state silent fallback only after `完成` no longer fits, then sync README / help overlay wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the final completed-badge fallback and doc coverage.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two sub-items complete and leave the regression-guard follow-up active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-sidebar-badge-runtime-tiers` if local refs permit creation; otherwise record the local ref-lock blocker and follow the established direct-on-`main` fallback while preserving the requested branch name in the audit line.

**Step 4: Append audit**

Record the implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
