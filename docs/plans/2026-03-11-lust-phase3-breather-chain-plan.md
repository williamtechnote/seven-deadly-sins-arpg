# Lust Phase 3 Breather Chain Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lengthen Lust phase-3 shared major-special recovery and require two lighter attacks between phase-3 major specials before considering any further weighting changes.

**Architecture:** Reuse the existing shared-recovery selector hook for the first task, then add one new phase-scoped “post major breather chain” metadata contract plus a small selector state counter for the second task. Keep the behavior localized to Lust phase 3.

**Tech Stack:** Phaser 3, plain JavaScript, source-hook CLI regressions

---

### Task 1: Lock the longer shared major-special recovery with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Change the regression to expect the longer Lust phase-3 `sharedAttackRecoveryMs.majorSpecial` value and matching README wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current data and README still describe the old shared recovery contract.

**Step 3: Write minimal implementation**

Raise the phase-3 shared recovery value in `data.js`, then sync README/TODO wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the longer shared recovery contract.

### Task 2: Lock the double-breather chain with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add assertions for a Lust phase-3 metadata object describing the trigger attacks, lighter breather attacks, required count, selector state initialization/reset, and the guard that blocks major specials while the breather chain is still pending.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the selector does not yet track or enforce the two-breather chain.

**Step 3: Write minimal implementation**

Add the new phase metadata and a small selector counter that is reset on phase entry, starts after a major special finishes, and decrements on each allowed light attack until another major special can be chosen.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the double-breather contract and README wording.

### Task 3: Keep the final observation explicit

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Rewrite the backlog**

Keep three ordered TODO items for this observation branch:
- longer shared recovery
- double light-attack breather chain
- one remaining live observation

**Step 2: Leave only the third item active**

After implementation, mark the first two items complete and keep the final observation as the sole active follow-up.
