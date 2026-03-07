# Inventory Autofill Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make backpack consumable clicks immediately confirm which quick slot received the item.

**Architecture:** Add a shared helper in `shared/game-core.js` to format the quick-slot feedback copy, call it from `InventoryScene` in `game.js`, and lock the behavior with source-hook and README assertions in `scripts/regression-checks.mjs`.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script.

---

### Task 1: Quick-slot feedback helper and regression

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a regression expecting a shared quick-slot feedback helper to exist and format slot numbers for the inventory auto-fill flow.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper/export does not exist yet.

**Step 3: Write minimal implementation**

Export a helper that maps the resolved quick-slot index to stable player-facing copy for the inventory feedback message.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper assertions.

### Task 2: Inventory prompt path, README, and source hooks

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add source-hook assertions expecting `InventoryScene` to allocate a transient auto-fill message text node and derive its copy from the shared helper, plus a README assertion for the new prompt wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the inventory message path and README copy do not exist yet.

**Step 3: Write minimal implementation**

Show a short-lived `已自动装入快捷栏 N` message after clicking a consumable, update README wording, and mark the completed TODO items.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.
