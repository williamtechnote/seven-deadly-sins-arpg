# Telegraph Closure Marker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an in-bar closure marker when a boss counter window opens on frame one but ends before the telegraph bar does.

**Architecture:** Extend the shared telegraph summary with one extra visibility/ratio pair, then let `BossScene` draw a dedicated marker from that shared state. Keep README/help/TODO aligned so the HUD contract and regression checks describe the same cue.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node regression checks.

---

### Task 1: Regression Guard

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for a frame-one counter window that closes inside the telegraph bar, plus source-text guards for the new draw path and updated docs.

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: FAIL because the new summary fields and render path do not exist yet.

### Task 2: Shared HUD Summary

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add `counterWindowClosureMarkerVisible` and `counterWindowClosureMarkerRatio` for the case `startOffset === 0 && end < telegraphDuration`.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS once the render/docs changes land too.

### Task 3: Boss HUD + Docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write minimal implementation**

Create one dedicated graphics layer for the closure marker, render it from the shared summary, document the cue in README/help text, mark the completed TODO, and promote one follow-up readability TODO.
