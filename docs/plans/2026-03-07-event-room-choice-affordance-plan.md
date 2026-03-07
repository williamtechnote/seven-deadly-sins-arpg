# Event Room Choice Affordance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make event-room choices easier to evaluate by showing immediate HP impact and gold affordability directly in the choice panel.

**Architecture:** Add pure helper functions in `shared/game-core.js` that derive state-aware choice preview text and affordability tags from the current player state plus event definition. Cover those helpers in `scripts/regression-checks.mjs`, then wire `game.js` to render the richer strings in the existing two-choice panel. Leave the shrine prompt tag as the next queued TODO.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: HP impact preview helper

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression coverage asserting that the healing fountain preview includes the projected healed amount and cleanse flag, and that the gambler shrine preview includes the projected HP loss based on current HP.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper is not exported yet.

**Step 3: Write minimal implementation**

Add and export a helper that formats a choice preview using the existing compact route text plus calculated HP delta when the effect changes HP.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage.

### Task 2: Gold affordability tag helper + panel wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add regression coverage asserting that gold-cost routes show `可负担` when the player has enough gold and `金币不足` otherwise.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper is not exported yet.

**Step 3: Write minimal implementation**

Add and export a helper for affordability tags, then update the event-room panel so each option line uses the richer preview plus the affordability tag when applicable.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage and existing event-room checks.

### Task 3: Finish docs and delivery

**Files:**
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that the event-room panel now previews immediate HP deltas and gold affordability before selection.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Run the required branch/commit/merge/push steps and record the actual outcome, including the local branch-lock blocker if it still persists.
