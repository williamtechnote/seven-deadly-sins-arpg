# Challenge Summary Fallbacks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add width-aware fallback chains for the visible ultra-compact run-challenge summary so progress/completion survives before generic ellipsis or full hiding.

**Architecture:** Reuse one shared label-width picker in `shared/game-core.js`, cover the new variant chains in `scripts/regression-checks.mjs`, and keep `game.js`/`README.md` aligned with the tighter visible-summary behavior. Limit this heartbeat to the first two TODO items and leave the oversized-reward follow-up active.

**Tech Stack:** Plain JavaScript, Phaser 3 UI scene, Node regression script

---

### Task 1: In-progress ultra-compact summary fallback

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

Add a regression asserting the visible `ultraCompact` challenge summary falls back from `挑战 12/30 · +90金` to `挑战 12/30`, then to `12/30`, when width budgets tighten.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper still returns the longest fixed single-line summary.

**Step 3: Write minimal implementation**

Extract a shared width-aware label picker and use it when `buildRunChallengeSidebarLines` builds the visible in-progress `ultraCompact` line.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new in-progress assertions.

### Task 2: Completed ultra-compact summary fallback

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add a regression asserting the visible completed `ultraCompact` summary falls back from `挑战完成 · +90金` to `挑战完成`, then to `完成`, before generic ellipsis.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because completed summaries still only expose the longest single-line copy.

**Step 3: Write minimal implementation**

Use the same width-aware picker for completed summaries, then document the new visible-summary fallback in `README.md` and the help copy in `game.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the completed-summary assertions.

### Task 3: Delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two fallback items complete and leave the oversized-reward follow-up active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-summary-fallbacks` if local refs permit creation; otherwise record the local ref-lock blocker and fall back to direct-main delivery plus a remote feature-branch push attempt.

**Step 4: Append audit**

Record implemented items, branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
