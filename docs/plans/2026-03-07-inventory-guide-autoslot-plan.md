# Inventory Guide Autoslot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the backpack-to-quick-slot auto-fill behavior visible in the in-game guide and README while giving regression checks a stable code hook.

**Architecture:** Extract the quick-slot placement rule into `shared/game-core.js`, reuse it in `game.js`, and verify both the helper output and the updated player-facing text from `scripts/regression-checks.mjs`.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script.

---

### Task 1: Shared quick-slot auto-fill rule and guide copy

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a regression that expects a shared helper to pick the first empty quick slot and asserts the help overlay mentions backpack click auto-fill.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper/export and new guide copy do not exist yet.

**Step 3: Write minimal implementation**

Export a helper for quick-slot auto-placement, use it from the inventory scene, and update the help overlay copy.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper and source-hook assertions.

### Task 2: README and regression sync for the keyboard loop

**Files:**
- Modify: `README.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a README assertion for the `Tab -> 点击背包消耗品 -> 1-4 使用` path.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because README does not mention the path yet.

**Step 3: Write minimal implementation**

Add concise README copy describing the backpack click auto-fill and the keyboard follow-up path.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.
