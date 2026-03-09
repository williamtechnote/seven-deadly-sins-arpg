# Unknown Reward Fallback Docs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Document and regression-guard the reward-bearing `未知挑战` fallback cases for regular and compact challenge summaries.

**Architecture:** Keep the shared challenge-summary logic unchanged and tighten only the written contract around it. Add failing regression assertions for the missing README/help-overlay wording, then update the docs text in `README.md` and `game.js` to satisfy those assertions.

**Tech Stack:** Plain JavaScript, Node CLI regression checks, Phaser runtime help copy, markdown docs.

---

### Task 1: Queue the heartbeat work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-unknown-reward-doc-fallbacks-design.md`
- Create: `docs/plans/2026-03-09-unknown-reward-doc-fallbacks-plan.md`

**Step 1: Write the concrete active queue**

Replace the placeholder active TODO entry with three ordered heartbeat items so the first two can be implemented immediately and the third remains queued.

**Step 2: Capture the design note**

Write the minimal design rationale and the implementation plan for this docs/regression heartbeat.

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add README/help-overlay assertions for the regular reward-bearing `未知挑战` fallback and the compact reward-bearing `未知挑战` fallback.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new wording is not documented yet.

**Step 3: Write minimal implementation**

Update `README.md` and the help overlay copy in `game.js` to include the two missing documented fallback cases.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new assertions.

### Task 3: Close the heartbeat loop

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completed TODO items**

Move the first two active items into the completed section with timestamps, leaving the third item active for the next cycle.

**Step 2: Verify and record**

Run the exact required heartbeat verification command, then append the audit line with branch, test, merge, push, and blocker fields.
