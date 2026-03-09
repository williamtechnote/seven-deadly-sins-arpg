# Ultra-Compact Unknown Challenge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock in that ultra-compact run-challenge summaries keep the existing progress/completion fallback ladder even when upstream label cleanup collapses to `未知挑战`.

**Architecture:** Add explicit shared helper coverage for ultra-compact visible summary variants so the label-agnostic behavior is intentional and testable. Extend regression coverage for in-progress and completed unknown-label cases, then sync README/help-copy wording and heartbeat tracking to match that decision.

**Tech Stack:** Plain JavaScript, Node CLI regression checks, Phaser runtime help copy in `game.js`, markdown docs.

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that a dedicated ultra-compact summary helper exists and returns the same variant ladders for in-progress and completed states even when the upstream label normalizes to `未知挑战`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper is not exported yet.

**Step 3: Write minimal implementation**

Add the shared helper in `shared/game-core.js`, export it, and route the existing ultra-compact branch through it.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper assertions.

### Task 2: Sync docs and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that ultra-compact single-line summaries ignore the `未知挑战` body fallback and keep the same `挑战 进度 · 奖励 -> 挑战 进度 -> 进度` / `挑战完成 · 奖励 -> 挑战完成 -> 完成` ladders without adding a new middle phrase.

**Step 2: Update TODO**

Split the remaining active TODO into concrete heartbeat items, then mark the implemented items completed and leave the list in the next actionable state.

**Step 3: Verify and record**

Run the exact required verification command, then append the required audit line to `PROGRESS.log` with branch/test/merge/push/blocker fields.
