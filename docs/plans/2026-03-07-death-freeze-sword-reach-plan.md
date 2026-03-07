# Death Freeze And Sword Reach Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stop post-death sliding in combat scenes and slightly increase early longsword reach.

**Architecture:** Add a single death-freeze hook on the `Player` class so both `LevelScene` and `BossScene` use the same stop/reset path. Adjust the sword base range in `data.js`, then lock both changes in with regression checks plus README/TODO updates.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Add failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Read: `game.js`
- Read: `data.js`

**Step 1: Write the failing tests**

- Assert `data.js` keeps the longsword base `range` at `55`.
- Assert `game.js` defines `Player.freezeForDeath()` with velocity reset and action cleanup.
- Assert both death paths call `this.player.freezeForDeath()`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the sword range is still `50` and the freeze hook is not implemented.

### Task 2: Implement the minimal fixes

**Files:**
- Modify: `game.js`
- Modify: `data.js`

**Step 1: Add centralized player death freeze**

- Add `freezeForDeath()` on `Player`.
- Clear movement velocity on sprite/body.
- Reset `isDodging` and `isAttacking`.
- Reuse the method from both combat-scene death paths.

**Step 2: Increase the longsword base range**

- Change `WEAPONS.sword.range` from `50` to `55`.

**Step 3: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 3: Documentation and completion

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

- Mark the already-landed shrine prompt short-tag TODO complete during reprioritization.
- Mark death-freeze and longsword reach tasks complete after implementation.
- Update README to mention the death freeze and longer starter sword reach.

**Step 2: Full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 3: Commit and integrate**

- Commit changes.
- Merge to `main`.
- Push `main`.
