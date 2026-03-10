# Challenge Decorator Follow-up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run-challenge sidebar normalization for western smart-quote decorators and nested mixed decorator wrappers, while leaving one dirtier decorator-payload item active for the next cycle.

**Architecture:** Keep production changes inside `shared/game-core.js` by widening the shared decorator-prefix stripping logic rather than adding summary-tier-specific cleanup. Lock the new behavior with regression tests first, then sync README/help copy so the documented rules match the shared helper.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Seed the cycle queue and failing regressions

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression cases proving:
- `“挑战”击败 30 个敌人` and `‘本局挑战’挑战：本局` follow the existing plain-text cleanup and `未知挑战` fallback rules.
- `【「挑战」】击败 30 个敌人` and `《〔本局挑战〕》挑战：本局` strip stacked decorator wrappers before the existing fallback chain.

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new decorator assertions.

### Task 2: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Extend the decorator wrapper stripping logic to recognize western smart quotes.
- Allow the decorator-prefix predicate to recurse through nested wrappers so mixed stacked decorators strip cleanly.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS for the new decorator assertions.

### Task 3: Sync docs for the implemented guarantees

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update docs/help copy**

- Document western smart-quote decorator cleanup.
- Document nested mixed decorator wrapper cleanup.

**Step 2: Re-run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Close the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark implemented items complete**

Move the first two Active TODO items to Completed with timestamps and leave the decorator-payload separator item in Active.

**Step 2: Attempt git delivery**

- Attempt `feat/auto-challenge-decorator-followup`.
- If local branch creation or main checkout/merge still fails, use at least one fallback and record the blocker explicitly in `PROGRESS.log`.
