# Shop Prep Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the boss-posture prep ladder into the merchant by turning the recent portal target into one compact consumable purchase recommendation and highlight.

**Architecture:** Add a shared shop recommendation helper that reuses the existing boss-aware consumable mapping, then let `ShopScene` render a small `采购参考` block and highlight the recommended item row/button without changing catalog order. Keep the existing blacksmith ladder untouched except for any shared mapping reuse.

**Tech Stack:** Phaser 3, plain JavaScript, shared helper exports in `shared/game-core.js`, regex/assert-based regression checks in `scripts/regression-checks.mjs`

---

### Task 1: Record The Heartbeat Scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-14-shop-prep-recommendation-design.md`
- Create: `docs/plans/2026-04-14-shop-prep-recommendation-plan.md`

**Step 1: Promote the heartbeat TODO**

Put the merchant prep recommendation item at the top of `## Active` and keep the remaining follow-up queue coherent.

**Step 2: Save the design doc**

Document the problem, approaches, chosen direction, and compact UI contract.

**Step 3: Save this plan doc**

Keep the implementation slices test-first and heartbeat-sized.

### Task 2: Write The Failing Tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Cover a new exported helper that:

- maps a sustain-heavy boss target to a `采购参考` for `净化药剂`
- maps a pressure-heavy boss target to a `采购参考` for `狂战油`
- stays silent for legacy string/null inputs

**Step 2: Add runtime regex assertions**

Check that:

- `game.js` imports the new helper
- `ShopScene` builds the recommendation from `GameState.portalPreparationTarget`
- the recommendation title/body render in the shop
- the recommended item row and buy button receive the highlight fill before disabled-state logic runs

**Step 3: Run the regression script to verify RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the missing helper/runtime wiring.

### Task 3: Implement The Shared Helper

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add the new merchant helper**

Return:

- `visible`
- `title`
- `lines`
- `itemKey`

Reuse the same boss-aware prep mapping already established for the blacksmith.

**Step 2: Export the helper**

Keep the helper available to runtime and regression checks without changing the existing blacksmith helper contract.

### Task 4: Implement ShopScene Consumption

**Files:**
- Modify: `game.js`

**Step 1: Render the compact prep block**

Show `采购参考` near the merchant header when the helper is visible.

**Step 2: Highlight the recommended row and button**

Tint the matching merchant item row/button while preserving the current buy interaction.

**Step 3: Re-run the regression script to verify GREEN**

Run: `node scripts/regression-checks.mjs`

Expected: PASS for the new helper/runtime checks.

### Task 5: Sync Docs And Close The Heartbeat

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README**

Add one concise sentence describing the merchant purchase recommendation ladder.

**Step 2: Mark TODO progress**

Move the merchant prep item to `Completed` and promote the remaining prep follow-up.

**Step 3: Run the required command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS.

**Step 4: Record the audit line**

Append the required `heartbeat-cycle` line with branch, checks, merge status, and blocker/fallback details.
