# Quick-Slot Text Measurement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let quick-slot fallback notices use real Phaser text width at runtime while preserving the shared heuristic fallback for CLI regression checks.

**Architecture:** Add an optional measurement callback to the shared quick-slot notice clamp and wire `InventoryScene` to provide a hidden Phaser text probe. Keep the browser and Node environments on the same public helper API so existing regression coverage remains valid.

**Tech Stack:** Plain JavaScript, Phaser 3 runtime text objects, shared game-core helpers, `node scripts/regression-checks.mjs`

---

### Task 1: Split the remaining TODO into heartbeat-sized work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-quickslot-text-measure-design.md`
- Create: `docs/plans/2026-03-07-quickslot-text-measure-plan.md`

**Step 1: Replace the single evaluation TODO with three concrete sub-items**

- shared helper measurement hook
- Phaser runtime wiring plus docs/regression sync
- later evaluation of broader rollout or caching

**Step 2: Leave only the third sub-item active after this heartbeat**

Run: `sed -n '1,12p' TODO.md`
Expected: the first two items are completed during the cycle and only the broader rollout/caching question remains active.

### Task 2: Write failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add a shared-helper assertion for custom width measurement**

```js
buildQuickSlotAutoAssignNotice(0, {
  assignedItemName: '圣疗秘藏浓缩生命药水',
  measureLabelWidth: (label) => ({ '圣': 14, '疗': 14, '秘': 14, '藏': 14, '…': 8 })[label] || 14
});
```

**Step 2: Add a source assertion for the Phaser runtime callback**

```js
/measureLabelWidth:\s*label\s*=>\s*this\._measureQuickSlotNoticeLabel\(label\)/
```

**Step 3: Tighten README/help assertions for runtime real-width measurement with heuristic fallback**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL before implementation because the shared helper ignores `measureLabelWidth`, `game.js` does not wire a Phaser measurement probe, and docs still only describe heuristic clamping.

### Task 3: Implement the measurement hook and runtime wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Extend the clamp helper to accept `measureLabelWidth`**

- use measured width when provided
- fall back to width weights otherwise
- preserve existing short-label outputs

**Step 2: Create a hidden Phaser text probe in `InventoryScene`**

- give it the toast font style
- add `_measureQuickSlotNoticeLabel()` to return actual width
- pass `measureLabelWidth` into `buildQuickSlotAutoAssignNotice()`

**Step 3: Update README and help overlay copy**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit and preserve the feature branch remotely if local refs remain blocked**

```bash
git add TODO.md PROGRESS.log README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/plans/2026-03-07-quickslot-text-measure-design.md docs/plans/2026-03-07-quickslot-text-measure-plan.md
git commit -m "feat: add quick-slot text measurement"
git push origin HEAD:refs/heads/feat/auto-quickslot-text-measure
git push origin main
```
