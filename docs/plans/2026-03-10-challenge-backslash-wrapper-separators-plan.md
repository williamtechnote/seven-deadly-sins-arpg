# Challenge Backslash Wrapper Separators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make challenge decorator payload cleanup accept wrapper-internal backslash separators and keep docs/tests in sync.

**Architecture:** Reuse the existing shared decorator-token normalization pipeline in `shared/game-core.js` by extending the separator regexes. Verify behavior through CLI regression assertions that also guard README and in-game help text updates.

**Tech Stack:** JavaScript, Node.js CLI assertions, Phaser source copy in `game.js`

---

### Task 1: Expose Two Active TODO Items

**Files:**
- Modify: `TODO.md`

**Step 1: Write the failing test**

No code-path test here; this is task bookkeeping before implementation.

**Step 2: Run test to verify it fails**

Not applicable.

**Step 3: Write minimal implementation**

Split the current active backslash work into:
- shared helper support
- README/help/regression sync

**Step 4: Run test to verify it passes**

Not applicable.

### Task 2: Add Failing Regression Coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `【\\挑战】击败 30 个敌人`
- `《本局挑战\\》挑战：本局`
- README/help text describing backslash separator cleanup

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new backslash assertions

**Step 3: Write minimal implementation**

Update shared helper regexes and copy strings.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Implement Shared Helper + Docs Sync

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Covered by Task 2.

**Step 2: Run test to verify it fails**

Covered by Task 2.

**Step 3: Write minimal implementation**

Extend the existing leading/trailing separator regexes to treat backslash as a wrapper-internal separator, then mention that path in docs/help copy.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
