# Challenge Copy Punctuation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden run-challenge decorator payload cleanup so wrapper-internal comma and semicolon separators normalize the same way as existing colon/dash/pipe/slash noise.

**Architecture:** Keep all normalization inside `shared/game-core.js` so visible summaries, hidden badges, feedback text, README examples, and CLI regression checks reuse the same source of truth. Apply TDD in two small passes: comma first, semicolon second.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Seed Active TODOs and write the first failing regression

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add comma-separator cases such as:
- `【、挑战】击败 30 个敌人` => `击败 30 个敌人`
- `《本局挑战，》挑战：本局` => `未知挑战`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new comma-separator assertions

### Task 2: Implement comma separator normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the shared leading/trailing separator regexes so comma variants participate in the same decorator payload cleanup chain.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new comma-separator assertions

### Task 3: Write the second failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add semicolon-separator cases such as:
- `【；挑战】击败 30 个敌人` => `击败 30 个敌人`
- `《本局挑战;》挑战：本局` => `未知挑战`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new semicolon-separator assertions

### Task 4: Implement semicolon separator normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the same shared separator regexes to include ASCII/full-width semicolons.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for both comma and semicolon assertions

### Task 5: Sync docs and finish bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/help copy**

Document that wrapper-internal comma / semicolon separators also participate in challenge decorator payload cleanup.

**Step 2: Re-run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Finish git flow**

Attempt:
- create `feat/auto-challenge-copy-punctuation`
- commit the change
- merge to `main`
- push `main`

If any git operation is blocked, attempt at least one fallback and record the exact blocker in `PROGRESS.log`.
