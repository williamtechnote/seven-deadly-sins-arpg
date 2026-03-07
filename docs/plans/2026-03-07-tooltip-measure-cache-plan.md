# Tooltip Measurement And Quick-Slot Cache Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cache repeated quick-slot notice width measurements within one toast and make inventory tooltip placement use actual rendered text width.

**Architecture:** Extend the shared quick-slot clamp path with an internal measurement cache that can be shared across both sides of one overwrite notice. Add a shared tooltip clamp helper and route inventory tooltip display through a small scene helper that uses the tooltip text object's measured width after setting content.

**Tech Stack:** Plain JavaScript, Phaser 3 text objects, shared `game-core` helpers, `node scripts/regression-checks.mjs`

---

### Task 1: Split the broad active TODO into heartbeat-sized work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-tooltip-measure-cache-design.md`
- Create: `docs/plans/2026-03-07-tooltip-measure-cache-plan.md`

**Step 1: Replace the single evaluation TODO with three concrete follow-ups**

- quick-slot notice measurement cache
- tooltip actual-width clamp
- later broader rollout evaluation

**Step 2: Leave only the third item active after implementation**

Run: `sed -n '1,10p' TODO.md`
Expected: the first two items are marked complete during this heartbeat and the evaluation item remains active.

### Task 2: Write failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add a quick-slot cache assertion**

```js
let calls = 0;
buildQuickSlotAutoAssignNotice(0, {
  didOverwrite: true,
  assignedItemName: '回回回回回回药剂',
  replacedItemName: '回回回回回回药剂',
  measureLabelWidth: (label) => {
    calls += 1;
    return label === '回' ? 12 : 16;
  }
});
```

**Step 2: Add a tooltip clamp helper assertion and source hook assertion**

```js
assert.equal(getInventoryTooltipClampX(940, 180, 1024), 834);
/getInventoryTooltipClampX\(anchorX,\s*this\.tooltip\.width,\s*this\.cameras\.main\.width\)/
```

**Step 3: Tighten README/help assertions for width-aware tooltip placement**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL before implementation because the new helper/export/docs/source hooks do not exist yet.

### Task 3: Implement the first two active TODO items

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add per-notice measurement caching in the shared quick-slot helper**

- create one cache per notice build
- share it across assigned/replaced derived labels
- keep heuristic fallback unchanged

**Step 2: Add actual-width tooltip placement**

- export a shared tooltip clamp helper
- set tooltip text before positioning
- clamp with `this.tooltip.width`

**Step 3: Document the tooltip width behavior in README/help text**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit, preserve the feature branch remotely if local refs are still blocked, then merge/push main**

```bash
git add TODO.md PROGRESS.log README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/plans/2026-03-07-tooltip-measure-cache-design.md docs/plans/2026-03-07-tooltip-measure-cache-plan.md
git commit -m "feat: cache quick-slot measurements and clamp tooltips"
git push origin HEAD:refs/heads/feat/auto-tooltip-measure-cache
git push origin main
```
