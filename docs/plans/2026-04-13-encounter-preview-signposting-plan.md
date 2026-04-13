# Encounter Preview Signposting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade routed encounter previews from coarse route-family labels to compact objective previews that tell the player what the next room will ask first.

**Architecture:** Add a shared objective-preview helper in `shared/game-core.js`, route existing encounter-preview callsites through it, then update runtime surface hooks and docs so the same short labels stay aligned everywhere.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scene glue, shared game-core helpers, Node regression checks

---

### Task 1: Lock the new preview contract with failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add expectations for:

- `下间缓冲 · 双低压`
- `下间高压 · 三敌齐压`
- `下间淘金 · 双赏金`

Then update HUD/world-label/runtime regex checks so they fail until those previews are wired through.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL in the encounter-preview assertions.

### Task 2: Implement the shared helper and wire the surfaces

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the shared helper, thread `formatRunEventRoomChoiceEncounterPreview(...)` through it, and update settlement/world-summary surfaces that still show only the coarse route-family label.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS for the new objective-preview contract.

### Task 3: Sync docs and backlog

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-encounter-forecast-signposting.md`

**Step 1: Update docs**

Document the new objective-preview layer and how it differs from the richer room-entry/staging receipt copy.

**Step 2: Update TODO**

Promote the new preview-signposting item, then mark it complete after implementation.

### Task 4: Verify and close

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt git delivery**

Commit on `feat/auto-encounter-preview-signposting`, merge into `main`, and attempt to push `main` while keeping the feature branch intact.
