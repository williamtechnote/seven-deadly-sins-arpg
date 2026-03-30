# Telegraph Tail Glow Trim Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tighten the boss telegraph head marker's weak late glow during the final ~80ms so the endpoint stays easier to read.

**Architecture:** Keep the threshold decision in `shared/game-core.js` where the other tail-afterglow summary flags already live, then let `game.js` consume that new boolean only in the late-glow rendering branch. Cover the behavior with shared-summary assertions, rendering source assertions, and synced docs.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node-based regression checks.

---

### Task 1: Add the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add one shared-summary assertion for the final under-80ms state and one rendering/doc assertion for the trimmed late glow.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared summary does not yet expose the final-trim flag and the renderer/docs do not mention it.

### Task 2: Implement the minimal behavior

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add shared summary flag**

Expose a boolean that becomes true only when the live countdown head marker is visible and `remainingMs < 80`.

**Step 2: Consume the flag in the late-glow renderer**

Trim the outer late-glow rectangles so the glow sits closer to the marker during the final 80ms without changing the warm-flash branch.

**Step 3: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync player-facing docs and audit files

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO**

Mark the implemented active item complete and leave one new follow-up active item.

**Step 2: Update README**

Document that the weak late glow contracts near the final 80ms.

**Step 3: Append audit line**

Record the requested branch, actual branch fallback, test command, and merge/push status.
