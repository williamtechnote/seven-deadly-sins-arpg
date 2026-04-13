# First Shrine Posture Handoff Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the first event-room approach prompt so the portal's boss posture remains visible until the first shrine interaction.

**Architecture:** Reuse the shared prompt-label helper in `shared/game-core.js`, then thread `bossKey` from `LevelScene` into the prompt refresh path. Lock the behavior with regression checks and a concise README/TODO update.

**Tech Stack:** Vanilla JS, Phaser 3, shared game-core helpers, Node regression script

---

### Task 1: Add the failing shared-helper assertions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Assert that the prompt helper returns:

- `按F治疗 · 稳拍反制` for `healingFountain` with `bossKey: 'lust'`
- `按F效果 · 回体扛压` for `prayerShrine` with `bossKey: 'wrath'`
- the existing generic fallback when no boss cue exists

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the prompt helper does not yet append the boss posture cue.

### Task 2: Implement the minimal shared/runtime wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Extend the prompt helper so it can accept a target context and append the normalized boss cue.
- Pass `bossKey` from `LevelScene` into prompt refresh and initial prompt creation.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS for the new prompt-label assertions.

### Task 3: Document and verify

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync docs**

Add one concise README sentence describing the first-shrine posture handoff and move the TODO item to completed when done.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

Expected: PASS
