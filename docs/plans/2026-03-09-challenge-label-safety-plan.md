# Challenge Label Safety Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make regular/compact challenge summaries resilient to repeated mixed `本局/挑战` prefixes and prefix-only labels by normalizing them to readable objective copy or `未知挑战`.

**Architecture:** Keep the change in the shared challenge-sidebar helpers. Add failing regression coverage around `buildRunChallengeSidebarLines`, then make label normalization iterative and route regular/compact summaries through a single safe-label helper. Sync README/help copy to the same rule.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser scene help text, Node regression script

---

### Task 1: Seed the heartbeat work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-challenge-label-safety-design.md`

**Step 1: Update the active TODO list**

Record the two concrete label-safety tasks plus one follow-up evaluation item.

**Step 2: Save the design note**

Capture the recommended “iterative prefix stripping + safe fallback label” approach.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that prove:
- regular summaries strip repeated mixed prefixes like `本局挑战：挑战：本局击败 30 个敌人`
- compact summaries do the same in completed state
- prefix-only labels fall back to `未知挑战` instead of rendering a blank body/detail line

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because normalization only strips one mixed prefix pass today.

### Task 3: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Loop challenge-prefix stripping until the label stabilizes, then route summary builders through a helper that falls back to `未知挑战`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new label-safety assertions.

### Task 4: Sync docs and deliver

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Document the new repeated-prefix normalization and `未知挑战` fallback rule in README/help text.

**Step 2: Run heartbeat verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-label-safety` if local refs permit creation; otherwise record the ref-lock blocker and use the established direct-on-`main` fallback while preserving the requested branch name in the audit.
