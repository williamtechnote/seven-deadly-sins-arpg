# Quick-Slot Overwrite Direction Marker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make full-quickbar overwrite feedback show the old-to-new item direction when the short labels differ, while keeping docs and regression guards aligned.

**Architecture:** Reuse the existing quick-slot short-label map in `shared/game-core.js` and refine only the different-label overwrite branch of `buildQuickSlotAutoAssignNotice`. Keep the same-label compression path intact, then sync the runtime strings and regex-based regression checks to the new directional copy.

**Tech Stack:** Plain JavaScript, Phaser 3, Node.js regression script

---

### Task 1: Write failing regression checks for overwrite direction copy

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `buildQuickSlotAutoAssignNotice(0, { didOverwrite: true, assignedItemKey: 'staminaPotion', replacedItemKey: 'hpPotion' })`
- README/help copy mentioning the `旧短名 → 新短名` overwrite segment

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper, docs, and help text still use the old different-label overwrite wording.

### Task 2: Implement directional overwrite feedback

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Keep the same-label compression branch unchanged.
- When the assigned and replaced short labels differ, render `已覆盖 1 号槽位：旧短名 → 新短名`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new direction-marker checks.

### Task 3: Sync docs, TODO ordering, and heartbeat audit

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/backlog**

- Split the remaining Active TODO into three concrete sub-items and complete the first two.
- Update README/help text to the new overwrite direction wording.
- Leave the slot-number simplification as the remaining Active follow-up.

**Step 2: Run full heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
