# Telegraph Late Glow Color Temperature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cool the residual outer Boss telegraph late glow during the final sub-millisecond tail beat.

**Architecture:** Extend `buildBossTelegraphHudSummary` with one more late-glow flag that rides on the existing final-width-trim beat, then consume that flag in `game.js` to switch only the outer late-glow color. Keep TODO, README, help overlay, and regression checks aligned with the new contract.

**Tech Stack:** Vanilla JavaScript, Phaser 3 renderer, Node regression checks

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Assert `currentCountdownHeadMarkerLateGlowOuterWarmthMuted === false` at `remainingMs: 4`.
- Assert `currentCountdownHeadMarkerLateGlowOuterWarmthMuted === true` at `remainingMs: 1`.
- Assert the renderer switches the outer late-glow color when the flag is true.
- Assert README and the help overlay document the color-temperature trim.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new shared flag, renderer usage, and copy do not exist yet.

### Task 2: Implement the minimal production change

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Add `currentCountdownHeadMarkerLateGlowOuterWarmthMuted` on the existing final-width-trim path.
- Return the flag from the shared summary.
- Use a cooler outer late-glow color only when that flag is true.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and heartbeat records

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

- Document the outer late-glow color-temperature trim in README and the help overlay.
- Mark the completed TODO and add the next active follow-up item.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
