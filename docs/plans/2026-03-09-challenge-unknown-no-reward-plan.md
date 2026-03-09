# Challenge Unknown No-Reward Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock regular and compact challenge summaries onto the existing `未知挑战` no-reward fallback ladders and leave the ultra-compact hidden-badge follow-up active.

**Architecture:** Reuse the existing label-normalization path in `shared/game-core.js`, but export the safe-label helper so regressions can assert the shared rule directly. Add failing coverage in `scripts/regression-checks.mjs`, make the minimal shared export/code change, then sync `README.md` and `TODO.md`.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser HUD source hooks, Node regression script

---

### Task 1: Promote the heartbeat TODOs

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-challenge-unknown-no-reward-design.md`
- Create: `docs/plans/2026-03-09-challenge-unknown-no-reward-plan.md`

**Step 1: Seed the three follow-ups**

Add the two implement-now items plus one ultra-compact follow-up to `TODO.md`.

**Step 2: Save the design/plan notes**

Record the shared-helper approach and the deferred ultra-compact badge follow-up.

### Task 2: Write failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- exported `getRunChallengeSafeSidebarLabel`
- regular unknown-label no-reward summaries to keep `未知挑战` plus `进度:12/30` / `进度:30/30`
- compact unknown-label no-reward summaries to keep `未知挑战`
- README / help text to document both rules

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper is not exported and docs do not mention the unknown-label no-reward paths.

### Task 3: Implement the minimal shared/doc changes

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

Export the shared safe-label helper and update docs/help text to describe the `未知挑战` no-reward fallback behavior for regular and compact summaries.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Finish the heartbeat

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the first two items complete**

Leave the ultra-compact hidden-badge follow-up active.

**Step 2: Run heartbeat verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 3: Attempt git delivery**

Try `feat/auto-challenge-unknown-no-reward`; if local ref creation still fails, keep working on `main`, then push `HEAD` to `refs/heads/feat/auto-challenge-unknown-no-reward` before pushing `main`.

**Step 4: Append audit**

Record timestamp, implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
