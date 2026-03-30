# Telegraph Late Glow Height Trim Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Shorten the boss telegraph countdown-head outer residual late glow during the final sub-millisecond trim beat.

**Architecture:** Add one final-beat boolean to the shared telegraph summary, then consume it in the Phaser HUD renderer so the outer glow contracts vertically in sync with the already-trimmed shell/core/inner glow. Keep documentation and regression hooks aligned with the new contract.

**Tech Stack:** Phaser 3, vanilla JavaScript, Node-based regression checks

---

### Task 1: Queue the work in TODO

**Files:**
- Modify: `TODO.md`

**Step 1: Update TODO priority**

Keep the current outer late-glow height trim item active and add the next follow-up micro-trim item underneath it.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that:
- the shared telegraph summary exports `currentCountdownHeadMarkerLateGlowOuterHeightTrimmed`
- it stays `false` before the final sub-millisecond beat and flips `true` at the final beat
- the renderer uses that flag to shorten the outer late-glow rect
- README/help copy documents the behavior

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the missing shared-summary/rendering/doc contract

### Task 3: Implement the minimal code

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add summary flag**

Expose `currentCountdownHeadMarkerLateGlowOuterHeightTrimmed` from the shared telegraph summary only during the existing final trim beat.

**Step 2: Consume it in rendering**

Shorten the outer residual late glow Y/height/radius when the new flag is active.

**Step 3: Update docs**

Document the new outer late-glow height trim in the README and help overlay text.

### Task 4: Verify and close the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run targeted regression again**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

**Step 2: Run the required verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

Expected: PASS

**Step 3: Update TODO and audit log**

Mark the implemented item complete, leave the follow-up item active, and append the mandatory heartbeat audit line to `PROGRESS.log`.
