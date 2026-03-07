# Normal Enemy Pressure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce normal-enemy pressure by about 6% without changing bosses, then lock the balance intent in regression checks.

**Architecture:** Keep the gameplay change in `data.js` by lowering normal-enemy base `speed` values only. Add deterministic balance checks in `scripts/regression-checks.mjs` so the repo verifies both sides of the intent: early sword openings get safer against trash mobs, while boss openings do not materially widen.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression checks

---

### Task 1: Add failing balance regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Read: `data.js`

**Step 1: Write the failing test**

- Assert the normal-enemy speed table matches the new lowered baseline.
- Assert the boss speed table stays on the current baseline.
- Assert a deterministic opening-window model improves for the longsword vs normal enemies but remains effectively unchanged for bosses.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because `data.js` still contains the old enemy speeds.

### Task 2: Apply the minimal gameplay change

**Files:**
- Modify: `data.js`

**Step 1: Lower normal-enemy base movement speed**

- Update each entry in `ENEMIES` by roughly 6%.
- Keep all entries in `BOSSES` unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 3: Update docs and completion records

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync docs**

- Mark the first two Active TODO items complete.
- Document the reduced normal-enemy pressure and the new balance regression coverage in `README.md`.

**Step 2: Full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 3: Commit and integrate**

- Commit changes.
- Merge to `main`.
- Push `main`.
