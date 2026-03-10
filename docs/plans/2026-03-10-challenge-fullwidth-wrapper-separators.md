# Challenge Full-Width Wrapper Separators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run-challenge decorator payload cleanup so full-width wrapper separators (`｜`, `／`) participate in the same token normalization used for existing separator-tolerant decorator stripping.

**Architecture:** Reuse the shared separator cleanup in `shared/game-core.js` instead of adding new special cases downstream. Drive the change with regression tests in `scripts/regression-checks.mjs`, then sync README/help-overlay text so docs and assertions stay aligned.

**Tech Stack:** JavaScript, Node CLI regression checks, Markdown docs

---

### Task 1: Leading full-width wrapper separators

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add assertions for `【｜：挑战】击败 30 个敌人` and `《／本局挑战》挑战：本局`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

**Step 3: Write minimal implementation**

Extend the shared separator cleanup to treat `｜` and `／` as removable leading separator tokens inside wrapper payloads.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

### Task 2: Trailing full-width wrapper separators

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add assertions for `【挑战｜】击败 30 个敌人` and `《本局挑战／》挑战：本局`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

**Step 3: Write minimal implementation**

Reuse the same shared normalization so trailing full-width separators are removed before decorator token matching.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

### Task 3: Docs and audit sync

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `PROGRESS.log`

**Step 1: Document the new behavior**

Update README/help text to mention that wrapper-internal full-width separators such as `｜` / `／` are stripped before the usual `本局` / `挑战` dedupe pass.

**Step 2: Verify regression/docs coverage**

Run: `node scripts/regression-checks.mjs`

**Step 3: Record audit**

Append a PROGRESS audit line with branch, tests, merge status, and blockers if git locks still prevent the requested branch/merge flow.
