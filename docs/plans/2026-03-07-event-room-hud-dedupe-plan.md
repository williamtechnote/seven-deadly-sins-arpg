# Event Room HUD Dedupe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove duplicate resolved event-room HUD lines by shortening the chosen-route line and merging it with the settlement summary.

**Architecture:** Keep the summary derivation in `shared/game-core.js` so the browser HUD and CLI regression tests share the same formatting rules. Update `game.js` to consume the shared HUD lines rather than rebuilding resolved lines ad hoc.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node regression checks

---

### Task 1: Split the active TODO into ordered sub-items

**Files:**
- Modify: `TODO.md`

**Step 1: Replace the umbrella dedupe TODO with three concrete follow-ups**

**Step 2: Leave the third prefix-tuning item active after this cycle**

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Assert that resolved event-room route lines collapse to `已选: <label>`**

**Step 2: Assert that final HUD lines merge the chosen route with the settlement delta**

**Step 3: Run `node scripts/regression-checks.mjs` and confirm the new expectations fail before implementation**

### Task 3: Implement shared HUD dedupe helpers

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Update `buildRunEventRoomHudSummary()` so resolved route lines are label-only**

**Step 2: Add a shared helper that builds the final HUD lines and merges resolved route + settlement into one line**

**Step 3: Switch `game.js` to render the shared helper output**

### Task 4: Update docs and verify

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Document the merged resolved event-room summary in README**

**Step 2: Mark the first two TODO items complete and leave the third active**

**Step 3: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 4: Commit, merge to `main`, push `main`, and append the audit line**
