# Completed Target Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep regular completed challenge summaries semantically correct when corrupted data removes the ratio from a finished objective.

**Architecture:** Add failing regressions around the regular completed third-line helper in `shared/game-core.js`, then split the invalid-target completed fallback from the in-progress fallback. Sync `README.md` and the mirrored help text in `game.js` to the same completed-state rule.

**Tech Stack:** JavaScript, Phaser 3, shared browser/CLI helpers, Node-based regression checks

---

### Task 1: Capture the selected TODO items and design

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-completed-target-guards-design.md`

**Step 1: Update the active TODO list**

Replace the placeholder active entry with the concrete invalid-target completed-summary guard tasks.

**Step 2: Save the design note**

Document the minimal fix and why we should not invent synthetic completion ratios from bad data.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing tests**

Add assertions for regular completed summaries when `target<=0`:
- reward-bearing fallback should be `已完成  奖励:+90金`
- rewardless fallback should be `已完成`
- `未知挑战` body fallback should remain intact while the third line stays completed-state

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current completed helper falls back to `进行中`.

### Task 3: Implement the minimal helper fix

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Split `getRunChallengeRegularCompletedDetailVariants()` from the in-progress invalid-target fallback and return completed-state variants when `progressLabel` is empty.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new assertions.

### Task 4: Sync docs/help copy and verify

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update user-facing copy**

Document that regular completed summaries with invalid targets fall back to completed-state text rather than `进行中`.

**Step 2: Re-run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS
