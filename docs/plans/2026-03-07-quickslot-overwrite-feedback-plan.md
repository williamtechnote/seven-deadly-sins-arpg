# Quick-Slot Overwrite Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make full quick-bar auto-fill explicitly warn that slot 1 was overwritten, and document/regression-test that behavior.

**Architecture:** Keep the existing left-to-right auto-fill rule and slot-1 fallback. Extend the shared notice helper with overwrite context, thread that state through the inventory click path, and update the user-facing docs plus regression guards to match the new behavior.

**Tech Stack:** Plain JavaScript, Phaser 3, Node.js regression script

---

### Task 1: Write failing regression checks for overwrite feedback

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `buildQuickSlotAutoAssignNotice(0, { didOverwrite: true })`
- source hook that computes the full-quickbar case before showing the toast
- README/help copy mentioning the slot-1 overwrite rule

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because overwrite-aware copy and docs do not exist yet.

### Task 2: Implement overwrite-aware quick-slot feedback

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Extend `buildQuickSlotAutoAssignNotice` to accept overwrite context.
- Detect whether all quick slots are occupied before assignment.
- Show the overwrite-aware toast only for the fallback overwrite path.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new overwrite feedback checks.

### Task 3: Sync docs and backlog

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/backlog**

- Explain the full-quickbar overwrite rule in README/help-facing copy.
- Split the parent TODO into three sub-items, complete the first two, leave the third active.

**Step 2: Run full heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
