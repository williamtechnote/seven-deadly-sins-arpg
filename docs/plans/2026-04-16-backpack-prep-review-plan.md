# Backpack Prep Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the hub consumable-prep ladder by adding a compact backpack review block that shows the recommended item, owned count, and quick-slot readiness.

**Architecture:** Add one shared helper in `shared/game-core.js` that reuses the existing boss-aware consumable mapping and current inventory/quick-slot state. Let `InventoryScene` render that helper near the backpack header, shift the grid down when visible, and highlight the matching consumable row. Sync README, TODO, and the heartbeat audit trail after verification.

**Tech Stack:** Phaser 3, plain JavaScript, shared helper exports in `shared/game-core.js`, regex/assert-based regression coverage in `scripts/regression-checks.mjs`

---

### Task 1: Record The Heartbeat Scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-16-backpack-prep-review-design.md`
- Create: `docs/plans/2026-04-16-backpack-prep-review-plan.md`

**Step 1: Promote the next heartbeat target**

Replace the old evaluation-only Active TODO with a concrete follow-up that starts where the new backpack review stops.

**Step 2: Save the design doc**

Document why the backpack is the last missing hub review surface.

**Step 3: Save this plan doc**

Keep the implementation slices test-first and heartbeat-sized.

### Task 2: Write The Failing Tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Cover:

- stocked + slotted review output
- missing + unslotted review output
- legacy/null hidden cases

**Step 2: Add runtime and README assertions**

Check that:

- `InventoryScene` imports and calls the helper
- the title/body block is rendered near the header
- the item grid shifts down when the block is visible
- the recommended consumable row is highlighted
- README documents the new backpack review contract

**Step 3: Run RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the missing helper.

### Task 3: Implement The Shared Helper

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Reuse the existing prep mapping**

Factor the shared boss-aware consumable mapping into one helper path that can serve blacksmith, shop, and backpack.

**Step 2: Add backpack review output**

Return:

- `visible`
- `title`
- `lines`
- `itemKey`
- `ownedCount`
- `quickSlotIndex`

### Task 4: Implement InventoryScene Consumption

**Files:**
- Modify: `game.js`

**Step 1: Render the compact review block**

Show `备战复查` near the backpack header and refresh it whenever the grid rebuilds.

**Step 2: Highlight the recommended consumable row**

Tint the matching consumable box/name/count while preserving the existing click-to-auto-assign flow.

**Step 3: Run GREEN**

Run: `node scripts/regression-checks.mjs`

Expected: PASS for the new helper/runtime/README checks.

### Task 5: Sync Docs And Close The Heartbeat

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README**

Add one concise sentence describing the backpack prep review surface.

**Step 2: Mark TODO progress**

Move the backpack review item to `Completed` and promote the next meaningful follow-up.

**Step 3: Run the required command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS.

**Step 4: Record the audit line**

Append the required `heartbeat-cycle` line with branch, checks, merge status, and blocker/fallback details.
