# Challenge Copy Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Normalize noisy whitespace in challenge labels and explicit reward labels so every challenge summary surface keeps readable copy and consistent width budgets.

**Architecture:** Keep the change inside the shared challenge-summary helpers in `shared/game-core.js`. Add failing regressions first in `scripts/regression-checks.mjs`, then implement the smallest normalization helpers that regular, compact, ultra-compact, badges, and completion feedback already share. Sync README/help copy to the same rule.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser UI text, Node regression script

---

### Task 1: Seed the heartbeat TODOs

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-challenge-copy-normalization-design.md`

**Step 1: Update the active TODO list**

Record the two normalization fixes plus one follow-up guard item.

**Step 2: Save the design note**

Capture the shared-helper normalization approach and why it is safer than per-surface fixes.

### Task 2: Write the failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that prove:
- regular / compact challenge summaries collapse repeated half-width and full-width spaces in the normalized objective label
- explicit compound `rewardLabel` values collapse repeated whitespace before they feed ultra-compact summaries, completion feedback, and badges

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current helpers only trim ends and preserve noisy internal spacing.

### Task 3: Implement the shared normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add a shared whitespace-normalization helper, use it after challenge-prefix stripping, and route explicit `rewardLabel` values through it before deciding whether to fall back to `rewardGold`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new normalization assertions.

### Task 4: Sync docs and deliver

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Document that shared challenge/reward helpers collapse abnormal whitespace so all sidebar tiers, badges, and completion feedback keep the same width-budget behavior.

**Step 2: Run heartbeat verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-copy-normalization` if local refs permit creation; otherwise record the ref-lock blocker and use the established fallback of pushing `HEAD` to that remote branch after merging on `main`.
