# Quick-Slot Overwrite Item Label Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the replaced item's short label when inventory auto-fill overwrites quick slot 1, while keeping docs and regression checks aligned.

**Architecture:** Reuse the existing quick-slot short-label mapping inside the shared auto-assign notice helper. Capture the overwritten slot occupant before assignment in `InventoryScene`, pass it into the helper, and align README/help/regression checks with the updated player-facing wording.

**Tech Stack:** Plain JavaScript, Phaser 3, Node.js regression script

---

### Task 1: Write failing regression checks for overwrite labels

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `buildQuickSlotAutoAssignNotice(0, { didOverwrite: true, replacedItemKey: 'hpPotion' })`
- the inventory click path capturing the replaced slot item before assignment
- README/help copy mentioning the overwrite toast includes the replaced short label

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper, runtime hook, and docs do not yet mention the replaced item label.

### Task 2: Implement overwrite-label feedback

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Extend `buildQuickSlotAutoAssignNotice` to accept `replacedItemKey`.
- Resolve that key through the compact quick-slot label map with a stable fallback.
- Capture the previous slot-1 occupant before overwriting and pass it into the helper.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new overwrite-label checks.

### Task 3: Sync docs, TODO ordering, and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/backlog**

- Split the remaining Active TODO into three concrete sub-items and complete the first two.
- Explain the overwrite toast's replaced-item short label in README/help-facing copy.
- Leave the same-label compression refinement as the remaining Active follow-up.

**Step 2: Run full heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
