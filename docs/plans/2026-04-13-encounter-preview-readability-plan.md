# Encounter Preview Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make event-room previews say both the next-room posture and the concrete encounter picture.

**Architecture:** Add one shared helper in `shared/game-core.js` for encounter-composition phrases and route all UI/runtime surfaces through it. Keep `game.js` focused on presentation by consuming the shared preview string in settlement feedback.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Document and queue the work

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-next-room-signposting-methodology.md`
- Create: `docs/plans/2026-04-13-encounter-preview-readability-design.md`
- Create: `docs/plans/2026-04-13-encounter-preview-readability-plan.md`

**Step 1: Add the follow-up TODO**

Add a new `Next Up` item for objective-first encounter guidance after the current read-the-roster pass lands.

**Step 2: Add the methodology note**

Write a short practice doc describing the two-layer signposting pattern: route posture first, encounter picture second.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper and summary expectations**

Assert that encounter previews now read `下间缓冲 · 双低压`, `下间高压 · 三敌齐压`, and `下间淘金 · 双赏金`.

**Step 2: Add runtime-source expectations**

Assert that the choice panel still appends the shared preview string and that settlement feedback now uses a shared preview builder instead of only `encounterProfile.previewLabel`.

### Task 3: Implement the shared preview builder

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add the composition mapping helper**

Map routed encounter profiles to compact composition phrases.

**Step 2: Update shared preview consumers**

Make `formatRunEventRoomChoiceEncounterPreview` and resolved HUD summary reuse the richer preview string.

### Task 4: Implement runtime settlement feedback

**Files:**
- Modify: `game.js`

**Step 1: Consume the shared preview helper**

Use the shared encounter preview string in settlement feedback so the floating confirmation includes both layers.

**Step 2: Keep the fallback behavior**

If no preview string is available, stay silent rather than inventing extra copy.

### Task 5: Refresh README and finish TODO bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Document the new preview contract**

Add a concise README note explaining the new enemy-picture phrases.

**Step 2: Move the active TODO to completed**

Record the shipped result and promote the new objective-guidance item to `Active`.
