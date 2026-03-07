# Event Room Settlement Copy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compress resolved event-room HUD settlement copy by room type, implementing trade and healing variants this cycle.

**Architecture:** Add a shared compact settlement formatter that uses resolved choice metadata plus actual outcome values, then keep the HUD renderer consuming the shared summary object. Update docs and TODO state to reflect the remaining buff/blessing follow-up.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node regression checks

---

### Task 1: Lock follow-up TODO ordering

**Files:**
- Modify: `TODO.md`

**Step 1: Rewrite the active umbrella TODO into three ordered subitems**

**Step 2: Mark the first two subitems as this-cycle targets and keep the buff/blessing item active**

### Task 2: Write failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add assertions for compact resolved settlement copy for trade and healing rooms**

**Step 2: Run `node scripts/regression-checks.mjs` and confirm the new assertions fail for the current verbose copy**

### Task 3: Implement compact settlement formatting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add a shared helper that formats compact resolved settlement copy by effect type**

**Step 2: Wire `buildRunEventRoomHudSummary` to expose the compact resolved text while keeping unresolved summaries unchanged**

**Step 3: Keep the HUD render path simple and continue rendering chosen route + compact `结算:` line**

### Task 4: Update docs and verify

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Document the shorter resolved event-room settlement copy in README**

**Step 2: Mark completed TODO items and leave the next active follow-up**

**Step 3: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 4: Commit, merge to `main`, push `main`, and append the audit line**
