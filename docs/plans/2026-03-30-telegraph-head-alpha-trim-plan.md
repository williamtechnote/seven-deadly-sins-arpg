# Telegraph Head Alpha Trim Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a final 5ms shell-alpha trim to the Boss telegraph countdown head marker.

**Architecture:** Extend `buildBossTelegraphHudSummary` with one more tail-beat flag, then consume that flag in `game.js` when drawing the countdown head shell. Keep README and regression checks aligned with the new contract.

**Tech Stack:** Vanilla JavaScript, Phaser 3 renderer, Node regression checks

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Assert `currentCountdownHeadMarkerShellAlphaMuted === false` at `remainingMs: 5`.
- Assert `currentCountdownHeadMarkerShellAlphaMuted === true` at `remainingMs: 4`.
- Assert the renderer lowers shell alpha when the flag is true.
- Assert README documents the new 5ms beat.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new shared flag and renderer usage do not exist yet.

### Task 2: Implement the minimal production change

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Add `currentCountdownHeadMarkerShellAlphaMuted` for `remainingMs < 5` on the existing shell-cap-trim path.
- Return the flag from the shared summary.
- Lower the shell alpha in `game.js` only when that flag is true.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and heartbeat records

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

- Document the 5ms shell-alpha trim in README.
- Mark the completed TODO and add the next active follow-up item.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
