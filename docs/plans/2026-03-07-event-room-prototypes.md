# Event Room Prototypes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the remaining run-event-room prototypes by shipping playable `healingFountain` and `bloodContract` interactions with regression coverage and README/TODO updates.

**Architecture:** Extend the shared event-room pool and resolution helpers in `shared/game-core.js`, add regression tests first in `scripts/regression-checks.mjs`, and keep `game.js` focused on scene presentation plus applying the resolved player/runtime state. Recompute `GameState.runEffects` from both run modifiers and the resolved event room so the blood-contract buff persists across save/load.

**Tech Stack:** Phaser 3, vanilla JavaScript, Node regression checks

---

### Task 1: Re-prioritize and document the active queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-event-room-prototypes-design.md`
- Create: `docs/plans/2026-03-07-event-room-prototypes.md`

**Step 1: Split the remaining event-room work into two active TODO items**

**Step 2: Save the short design**

**Step 3: Save the implementation plan**

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write failing tests for `healingFountain` and `bloodContract`**

- Assert both rooms expose deterministic choice keys.
- Assert healing settlement updates HP and optional cleanse metadata.
- Assert blood-contract settlement persists selected choice and yields the expected run multipliers.

**Step 2: Run `node scripts/regression-checks.mjs` and verify failure**

### Task 3: Implement shared event-room helpers

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add minimal room definitions for the two missing prototypes**

**Step 2: Extend event-room settlement handling for heal/cleanse and run-multiplier choices**

**Step 3: Add a helper that derives event-room run effects from the resolved choice**

**Step 4: Re-run `node scripts/regression-checks.mjs` and verify the new checks pass**

### Task 4: Wire runtime and scene behavior

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Recompute `GameState.runEffects` from modifiers + event-room effects**

**Step 2: Generalize event-room scene rendering/feedback for all room types**

**Step 3: Apply heal/cleanse runtime effects to the player after settlement**

**Step 4: Update README documentation**

### Task 5: Verify and record the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 2: If verification passes, commit and merge to `main`, then push `main`**

**Step 3: Append the mandatory audit line with exact branch/merge/push status, including fallback details if branch creation remains blocked**
