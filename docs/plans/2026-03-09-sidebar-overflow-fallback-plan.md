# Sidebar Overflow Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce ultra-compact sidebar overflow by tightening vertical spacing first, then hide the challenge summary only as a last resort.

**Architecture:** Add shared sidebar overflow-policy helpers in `shared/game-core.js`, then have `UIScene` consume them when building the fixed sidebar stack. Preserve existing regular and compact behavior while changing only the ultra-compact tier. Cover the behavior in the regression script and sync player-facing docs.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Write regression coverage for the new ultra-compact overflow policy

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add assertions for:
- a shared ultra-compact sidebar stack policy helper that returns tighter gaps/safe-bottom padding
- a priority-layout case where `challengeText` is hidden only after `eventRoomText` and `runModifierText`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new helper/export and hiding order do not exist yet.

**Step 3: Write minimal implementation**

Add the shared helper/export and wire `UIScene` layout construction through it.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new sidebar policy assertions.

### Task 2: Apply the overflow policy in `UIScene`

**Files:**
- Modify: `game.js`

**Step 1: Write the failing test**

Add source assertions that `UIScene` reads the shared stack policy helper and conditionally marks `challengeText` droppable in ultra-compact mode.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the source does not yet contain the new policy hooks.

**Step 3: Write minimal implementation**

Update `_getHudSidebarMaxBottom()` and `_layoutHudSidebarBlocks()` to use the shared policy helper and last-resort challenge dropping.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Sync docs and task tracking

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the tighter ultra-compact spacing and the final hiding order including challenge summary.

**Step 2: Verify**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
