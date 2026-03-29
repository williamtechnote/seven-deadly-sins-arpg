# Lust Illusion Bridge Follow-up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase 3 so `illusion` hands off to `mirageDance` through one more directed light-pressure pair, giving the player a slightly clearer reset before the next major special.

**Architecture:** Keep the change data-driven by extending the phase-3 attack table in `data.js`. Lock the behavior with regression assertions in `scripts/regression-checks.mjs`, then sync the player-facing pacing note in `README.md` and the heartbeat queue in `TODO.md`.

**Tech Stack:** Vanilla JavaScript, Phaser 3 data/config, Node-based regression checks

---

### Task 1: Lock the new bridge expectation

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Raise the expected `illusion -> mirageDance` bridge length and exact sequence by one extra `charmBolt` / `dash` pair.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the Lust illusion-to-mirage bridge assertions.

### Task 2: Extend the phase-3 bridge

**Files:**
- Modify: `data.js`

**Step 1: Write minimal implementation**

Append one extra `charmBolt`, `dash` pair between `illusion` and `mirageDance` in Lust phase 3.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated bridge assertions.

### Task 3: Sync docs and heartbeat state

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update docs**

Describe that `illusion` now hands off through an even longer directed `charmBolt` / `dash` bridge before `mirageDance`.

**Step 2: Update heartbeat queue**

Split the old observation item into the new completed bridge task plus the next observation task.

### Task 4: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Commit and push with fallback**

If local branch/main checkout is still blocked, commit on the current branch, push `HEAD` to `feat/auto-lust-illusion-bridge-followup`, and fast-forward remote `main` only after verifying `origin/main` is an ancestor.
