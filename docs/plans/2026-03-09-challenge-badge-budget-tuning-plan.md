# Challenge Badge Budget Tuning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tighten the ultra-compact lightweight challenge badge heading budget so the `本局词缀` title keeps more horizontal room before the final fallback badge starts competing.

**Architecture:** Add a shared badge-heading layout helper in `shared/game-core.js`, cover it in `scripts/regression-checks.mjs`, and have `UIScene` consume the helper for both badge width and gap instead of hardcoded constants. Keep the third “further evaluation” TODO item active.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Badge width-share tightening

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression coverage for a shared `getRunModifierHeadingBadgeLayout` helper that returns a stricter ultra-compact `maxWidth` than the previous `0.42` share.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper does not exist and `UIScene` still hardcodes the older badge width budget.

**Step 3: Write minimal implementation**

Add the helper in `shared/game-core.js`, export it, import it in `game.js`, and replace the hardcoded badge width-share logic.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the tighter width-share coverage.

### Task 2: Heading-gap tightening

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Extend the same helper coverage to assert the ultra-compact heading gap is tighter than the previous `8px`, and add a source-hook check proving `UIScene` consumes the shared `gap`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `UIScene` still uses a hardcoded gap.

**Step 3: Write minimal implementation**

Wire the shared `gap` into `_updateRunModifierHeading`, then update README / 帮助文案 to mention the tighter heading budget and spacing.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the tighter gap and docs/source-hook coverage.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two sub-items complete and leave the follow-up evaluation item active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-badge-budget-tuning` if local refs permit creation; otherwise record the local ref-lock blocker and try the established fallback path while preserving the requested branch name.

**Step 4: Append audit**

Record the implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
