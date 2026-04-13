# Crafting Affordance Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make blacksmith crafting rows show pre-click affordability and batch potential instead of relying on post-click error messages.

**Architecture:** Add a shared helper that converts a recipe plus current player resources into a compact affordance label/state, then have `BlacksmithScene` use it for row copy, disabled button styling, and click gating. Drive the change with regression assertions first, then sync README and the audit trail.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the backlog and design trail

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-10-crafting-affordance-readability-design.md`
- Create: `docs/plans/2026-04-10-crafting-affordance-readability-plan.md`

**Step 1: Update the active TODO**

Record `铁匠制作可负担读图` as the active item and move the already-implemented formation-routing work to `Completed`.

**Step 2: Save the design + plan docs**

Capture the rejected alternatives, chosen direction, and TDD-first execution outline.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new crafting affordance helper that:

- returns `可做xN` when a recipe is craftable multiple times
- returns a gold-shortfall label when gold is the blocker
- returns a material-shortfall label naming the missing material

**Step 2: Add runtime-hook assertions**

Extend the existing source checks so they fail until `BlacksmithScene` routes recipe rows and button state through the new helper.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper and runtime hook do not exist yet.

### Task 3: Implement the shared helper and blacksmith UI hook

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared crafting affordance helper**

Export a deterministic helper that derives `{ label, canCraft, maxCraftable }` from recipe cost, materials, and current state.

**Step 2: Update BlacksmithScene**

Use the helper to append the affordance label to each craft row, tint blocked buttons differently, and skip click attempts when crafting is already known to be blocked.

**Step 3: Keep implementation minimal**

Do not add a new tooltip panel or blacksmith-only state machine; only change the row-level readability contract needed for this feature.

### Task 4: Sync docs and verify

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Document that blacksmith recipes now show pre-click affordability and batch potential.

**Step 2: Run the required commands**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

### Task 5: Close out the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Append the audit line**

Record task, branch, test command result, merge status, push status, blocker, and fallback.

**Step 2: Attempt git integration**

Try the repo git flow without committing on `main`; if locks or dirty-tree constraints still block it, record the exact failure and fallback.
