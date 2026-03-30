# Action HUD Stamina ETA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a short stamina recovery ETA on the combat action HUD when an action is blocked only by missing stamina.

**Architecture:** Keep the behavior in `shared/game-core.js` so the formatting stays deterministic and regression-testable. Wire the live effective stamina regen from `game.js` into the helper and document the new player-facing behavior in `README.md`.

**Tech Stack:** Vanilla JavaScript, Phaser 3 UI scene, Node-based regression checks.

---

### Task 1: Lock the HUD contract with failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Change the stamina-gated action HUD expectation from `差X体` to `差X体/时间`.
- Add a zero-regen fallback assertion.
- Add a source-hook assertion for the new helper input in `game.js`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL in `combat action HUD summary helper` or the HUD source-hook assertion because the helper does not yet format or receive stamina ETA data.

### Task 2: Implement the minimal HUD ETA behavior

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Add a small formatter for stamina recovery seconds.
- Extend `formatCombatActionReadyLabel` and `buildCombatActionHudSummary` to accept `staminaRegenPerSecond`.
- Pass the effective regen rate from `UIScene.updateHUD`.
- Keep cooldown labels and zero-regen fallback behavior unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS.

### Task 3: Document and verify

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Document the behavior**

- Update the quick-start HUD description so the new ETA is discoverable.
- Mark the TODO item complete and promote the next active item.

**Step 2: Run full required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

Expected: PASS.
