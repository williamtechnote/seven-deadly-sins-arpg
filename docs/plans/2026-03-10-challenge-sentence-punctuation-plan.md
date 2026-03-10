# Challenge Sentence Punctuation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden run-challenge decorator payload cleanup so wrapper-internal period, exclamation, and question punctuation normalizes the same way as the existing separator set.

**Architecture:** Keep all behavior inside `shared/game-core.js` so summaries, hidden badges, completion feedback, README text, and help-overlay copy keep using one source of truth. Apply TDD in two narrow passes: period first, then exclamation/question punctuation.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Seed Active TODOs and write the first failing regression

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add period-separator cases such as:
- `【。挑战】击败 30 个敌人` => `击败 30 个敌人`
- `《本局挑战。》挑战：本局` => `未知挑战`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new period-separator assertions

### Task 2: Implement period separator normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the shared leading/trailing separator regexes so period punctuation participates in the same decorator payload cleanup chain.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new period-separator assertions

### Task 3: Write the second failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add exclamation/question cases such as:
- `【!挑战】击败 30 个敌人` => `击败 30 个敌人`
- `《本局挑战？》挑战：本局` => `未知挑战`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new sentence-punctuation assertions

### Task 4: Implement exclamation/question normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the same shared separator regexes to include ASCII/full-width exclamation and question punctuation.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for both period and exclamation/question assertions

### Task 5: Sync docs and finish bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/help copy**

Document that wrapper-internal period / exclamation / question separators also participate in challenge decorator payload cleanup.

**Step 2: Re-run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Finish git flow**

Attempt:
- create `feat/auto-challenge-sentence-punctuation`
- commit the change
- merge to `main`
- push `main`

If any git operation is blocked, attempt at least one fallback and record the exact blocker in `PROGRESS.log`.
