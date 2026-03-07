# Event Room HUD Wrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the event-room HUD easier to scan by splitting route summaries into compact lines and shortening the metadata line.

**Architecture:** Keep formatting rules in `shared/game-core.js` so the HUD summary stays testable outside Phaser. Update `game.js` to render the structured summary fields directly, then sync docs and TODO state.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Lock the new HUD summary contract with failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that:
- unresolved event rooms expose a short metadata line and two compact route lines
- resolved event rooms expose a short metadata line and one chosen-route line

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the event-room HUD summary section because the new fields/strings do not exist yet.

### Task 2: Implement compact shared summary formatting

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Return compact metadata and route-line fields from `buildRunEventRoomHudSummary`, while preserving existing fields if other code still reads them.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the event-room HUD summary test.

### Task 3: Render the compact summary in the Phaser HUD and sync docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update the HUD renderer**

Use the compact metadata line and route lines from the shared helper instead of the old single joined route string.

**Step 2: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Commit and integrate if verification is green

**Files:**
- Modify: git history / refs

**Step 1: Commit**

Commit the heartbeat delta with the updated docs/tests/code/logs.

**Step 2: Merge/push**

If feature-branch creation succeeds, merge to `main` and push `main`.
If branch creation remains blocked by ref-lock permissions, record the blocker explicitly in `PROGRESS.log` and use the best available fallback.
