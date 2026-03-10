# Challenge Straight-Quote And Separator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden challenge/sidebar normalization against separator-only decorator payloads and ASCII straight-quote decorators while leaving nested ASCII mixed wrappers active for the next cycle.

**Architecture:** Keep production changes inside `shared/game-core.js` so every challenge/sidebar surface reuses the same sanitized label pipeline. Lock the first two TODO items with regression checks before implementation, then sync README/help overlay text to the new guarantees.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Seed the queue and write failing regressions

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression cases proving:
- `【：】击败 30 个敌人` strips the separator-only wrapper and keeps the body label.
- `《-》挑战：本局` strips the wrapper, exhausts the remaining prefixes, and falls back to `未知挑战`.
- `"挑战"击败 30 个敌人` and `'本局挑战'挑战：本局` behave like the existing smart-quote decorators.

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new challenge-label assertions.

### Task 2: Implement the shared helper changes

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Allow separator-only decorator payloads to count as removable challenge tokens after normalization.
- Extend the decorator pair list to include ASCII `'` / `"` wrappers.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS for the new separator-only and straight-quote assertions.

### Task 3: Sync docs for the implemented guarantees

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update docs/help copy**

- Document separator-only wrapper payload cleanup.
- Document ASCII straight-quote decorator cleanup.

**Step 2: Re-run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Finish bookkeeping

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark implemented items complete and leave the third TODO active**

Move the first two Active TODO items to Completed with timestamps; keep the nested ASCII mixed-wrapper item active.

**Step 2: Commit / merge / push with fallback**

- Attempt the requested `feat/auto-challenge-straight-quote-separator` branch flow.
- If local branch creation or main merge still fails due git-lock permissions, use at least one fallback and record the blocker explicitly in `PROGRESS.log`.
