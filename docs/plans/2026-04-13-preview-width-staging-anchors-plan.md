# Preview Width Staging Anchors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let wide shrine-side preview surfaces restore a compact staging anchor while tight surfaces keep the existing route-plus-objective contract.

**Architecture:** Extend the shared routed-encounter preview helper so it can choose between full and compact preview variants using a width budget, then wire that helper into the choice panel and HUD/sidebar summary. Keep staging receipts and room-entry cues unchanged.

**Tech Stack:** Vanilla JS, Phaser 3, shared gameplay helpers, Node regression script

---

### Task 1: Lock the width-layering contract in failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Assert that the new shared preview ladder can return:

- `下间缓冲 · 双低压 · 先稳前排`
- `下间高压 · 三敌齐压 · 先拆夹角`
- `下间淘金 · 双赏金 · 先盯后排`

when width allows, and falls back to the current compact preview when it does not.

**Step 2: Update choice/HUD expectations**

Make the wide choice-panel preview and width-aware HUD summary assertions expect the restored staging anchors.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the shared width-aware preview formatter and runtime wiring do not exist yet.

### Task 2: Implement the shared formatter and runtime wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the preview-width helper**

Create a helper that maps routed encounter profiles to preview staging anchors and chooses full vs compact preview text from a width budget.

**Step 2: Upgrade preview callsites**

Use the new formatter in:

- `formatRunEventRoomChoiceEncounterPreview(...)`
- `buildRunEventRoomHudSummary(...)`
- the choice-panel option-row builder in `game.js`

**Step 3: Run regression to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 3: Sync docs and backlog

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `docs/methodology/arpg-preview-width-layering.md`

**Step 1: Mark the TODO complete**

Move the active width-layering item into `Completed` and leave the run-memory follow-up queued.

**Step 2: Update player-facing copy**

Document that wide shrine preview surfaces can now show `下间X · staging anchor · 首拍目标`, while narrow surfaces keep the compact forecast.

### Task 4: Verify and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required full verification**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Commit, merge, and push**

Commit on `feat/auto-preview-width-staging-anchors`, merge to `main`, push `main`, keep the feature branch, then append the mandatory audit line.
