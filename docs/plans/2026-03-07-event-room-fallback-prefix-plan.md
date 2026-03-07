# Event Room Fallback Prefix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve the generic `已选:` resolved-prefix fallback for unknown event-room types and lock it in with regression coverage and docs.

**Architecture:** Reuse the existing shared event-room HUD helpers in `shared/game-core.js` so both Phaser HUD rendering and Node regression checks derive the same resolved strings. Use a pool override in tests to exercise the unknown-type path without expanding the main content pool.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node CLI regression checks

---

### Task 1: Split the remaining TODO into concrete ordered work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-event-room-fallback-prefix-design.md`
- Create: `docs/plans/2026-03-07-event-room-fallback-prefix-plan.md`

**Step 1: Replace the single active TODO with three concrete fallback follow-ups**

**Step 2: Keep the first two items implementation-ready and leave one additional follow-up active for the next cycle**

### Task 2: Write the failing regression first

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add an unknown-type event-room fixture via `poolOverride`**

**Step 2: Assert `buildRunEventRoomHudSummary()` returns `已选: <label>` for the resolved route**

**Step 3: Assert `buildRunEventRoomHudLines()` merges the resolved line as `已选: <label> · <compact settlement>`**

**Step 4: Run `node scripts/regression-checks.mjs` and confirm the new expectation fails before implementation**

### Task 3: Implement the shared fallback and sync docs

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`

**Step 1: Make the shared resolved-prefix helper normalize unknown types to the generic `已选` label**

**Step 2: Update README to document the fallback behavior for unknown/future event-room types**

**Step 3: Re-run `node scripts/regression-checks.mjs` and verify the fallback checks pass**

### Task 4: Verify and record the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the first two active TODO items complete and leave the third active if still pending**

**Step 2: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 3: Attempt branch/commit/merge/push workflow and append the mandatory audit line with exact outcomes**
