# Compact Challenge Tight Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve readable compact challenge detail lines under tighter width budgets by adding one more semantic label fallback before generic truncation.

**Architecture:** Extend the shared compact challenge detail variant builder in `shared/game-core.js`, then prove the behavior through narrow-budget regression checks and sync the public docs/help copy to the new fallback chain.

**Tech Stack:** JavaScript, Phaser 3, shared CLI/browser helpers, Node-based regression checks

---

### Task 1: Split TODO and capture the design

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-compact-challenge-tight-labels-design.md`

**Step 1: Update the active TODO list**

Split the single active item into separate compact in-progress and compact completed fallback guards.

**Step 2: Save the design note**

Record the minimal whitespace-tightened fallback approach and why it is preferred over new authored short labels.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add one compact in-progress assertion and one compact completed assertion using `rewardLabel: '+9999金 +净化'` and a width budget that rejects `击败 30 个敌人` but still accepts `击败30个敌人`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new compact tighter-budget assertions because the helper only returns the spaced label today.

### Task 3: Implement the minimal helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Introduce a shared compact-detail variant helper that returns:
- `label · reward`
- `label`
- whitespace-tightened `label` when it differs

Use it for both compact in-progress and compact completed detail lines.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new compact tighter-budget assertions.

### Task 4: Sync docs/help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update user-facing docs**

Document the compact second-line chain as `击败 30 个敌人 · +90金 -> 击败 30 个敌人 -> 击败30个敌人` for both in-progress and completed paths, including future compound reward labels.

**Step 2: Re-run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS
