# Challenge Badge Tight Tiers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add narrower ultra-compact heading-budget tiers so the lightweight challenge badge yields more horizontal space to the `本局词缀` title before the final fallback becomes visually competitive.

**Architecture:** Keep the existing shared heading-layout helper in `shared/game-core.js`, but make it tier on tighter `maxWidth` budgets inside `ultraCompact` instead of using one fixed ratio and gap. Cover the tighter tiers in `scripts/regression-checks.mjs`, then let `game.js` keep consuming the helper unchanged. Leave the final evaluation TODO item active.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD scene code, Node regression script

---

### Task 1: Tighter ultra-compact badge-width tiers

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression assertions showing that `getRunModifierHeadingBadgeLayout` returns a smaller ultra-compact `maxWidth` once the heading budget drops below a tighter threshold.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper still uses one fixed ultra-compact width ratio.

**Step 3: Write minimal implementation**

Add tighter width-share branches inside the helper while preserving a safe minimum badge width.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new tighter-tier width assertions.

### Task 2: Tighter ultra-compact heading-gap tiers

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Extend helper coverage to assert that the heading gap tightens again under the same narrower ultra-compact budget tiers, and update docs expectations accordingly.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper still returns a single ultra-compact gap value and docs do not mention tighter budget tiers.

**Step 3: Write minimal implementation**

Return tighter gap values from the shared helper and refresh README / help-overlay copy to describe the new narrower-tier behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Delivery and audit

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two active items complete and keep the stability follow-up active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit, merge, push**

Attempt `feat/auto-challenge-badge-tight-tiers`; if local refs are still blocked, record that blocker and use the established remote-branch fallback before pushing `main`.

**Step 4: Append audit**

Record timestamp, implemented items, branch outcome, exact test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
