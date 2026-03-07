# Quickslot Autofill Shortcopy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compress the non-overwrite backpack auto-fill toast into the same slot-led shortform family as the existing overwrite copy.

**Architecture:** Extend the shared `buildQuickSlotAutoAssignNotice()` helper so both browser runtime code and CLI regression checks read from one copy source. Keep the first two TODO items scoped to known-label and missing-label success paths, and leave deeper compression experiments as a later follow-up.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Reorder the TODO into three concrete sub-items

**Files:**
- Modify: `TODO.md`

**Step 1: Update the active list**

Reword the single umbrella item into three ordered sub-items:
- `快捷栏N：装入 <短名>`
- `快捷栏N：已装入`
- future compression evaluation

**Step 2: Verify the TODO ordering by reading the file**

Run: `sed -n '1,20p' TODO.md`
Expected: three ordered Active items with the first two implementable immediately

### Task 2: Write failing regression coverage for the first 2 items

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing tests**

Add assertions that expect:
- `buildQuickSlotAutoAssignNotice(0, { assignedItemKey: 'hpPotion' })` -> `快捷栏1：装入 HP`
- `buildQuickSlotAutoAssignNotice(0)` -> `快捷栏1：已装入`

Also update README/help-overlay source checks to match the new shortform documentation.

**Step 2: Run the regression script and verify it fails for the new copy**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the updated quick-slot notice assertions before implementation

### Task 3: Implement the minimal shared helper and documentation changes

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update the helper**

Make the success path slot-led:
- with known label: `快捷栏N：装入 <短名>`
- without known label: `快捷栏N：已装入`

**Step 2: Sync docs/UI copy**

Replace the old `已自动装入快捷栏 N` wording in README and help text with the new shortform family.

**Step 3: Re-run the regression script**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Final verification and delivery

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit and delivery**

Run the required git steps for commit, main merge, push, and preserved feature branch fallback if local branch creation is blocked.
