# Challenge No-Reward Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the rewardless challenge-summary fallback ladders explicit and regression-guarded for the regular and compact sidebar tiers.

**Architecture:** Keep the change in the shared challenge-summary helpers inside `shared/game-core.js`. Add failing regressions first in `scripts/regression-checks.mjs`, then export small shared variants helpers so regular and compact no-reward copy is directly testable. Sync `README.md` to the same behavior.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser HUD copy, Node regression script

---

### Task 1: Seed the heartbeat artifacts

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-challenge-no-reward-guards-design.md`
- Create: `docs/plans/2026-03-09-challenge-no-reward-guards-plan.md`

**Step 1: Update the active TODO list**

Split the single no-reward TODO into three concrete tier-specific items and prioritize regular + compact first.

**Step 2: Save the design and plan notes**

Capture the shared-helper approach and the exact TDD sequence for the heartbeat.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- exported regular in-progress / completed no-reward detail variants helpers
- exported compact in-progress / completed no-reward detail variants helpers
- rewardless regular / compact sidebar lines to keep their existing semantic fallback ladders under narrow widths

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new helper exports and/or explicit regular variants helpers do not exist yet.

### Task 3: Implement the minimal shared-helper changes

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add explicit regular in-progress / completed variants helpers, keep compact on the existing shared detail helper, and export all four variants helpers for direct regression coverage.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new no-reward assertions.

### Task 4: Sync docs and finish the heartbeat

**Files:**
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Document that regular / compact rewardless challenge paths do not insert placeholder reward text and stay on the same semantic fallback ladders.

**Step 2: Run heartbeat verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-no-reward-guards` if local refs permit creation; otherwise keep the worktree on `main`, push `HEAD` to `refs/heads/feat/auto-challenge-no-reward-guards`, then merge/push `main` and record the ref-lock blocker in `PROGRESS.log`.
