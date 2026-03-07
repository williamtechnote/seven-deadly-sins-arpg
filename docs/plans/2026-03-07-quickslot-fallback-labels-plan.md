# Quick-Slot Fallback Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace overly generic quick-slot missing-shortname fallback copy with compact labels derived from item names, while preserving existing short-label behavior.

**Architecture:** Extend the shared quick-slot notice helper with a label resolver that prefers handcrafted abbreviations and otherwise derives a compact fallback from localized item names. Pass item names from the game runtime so browser UI and CLI regression checks stay aligned.

**Tech Stack:** Plain JavaScript, shared game-core helpers, source-based regression checks via `node scripts/regression-checks.mjs`

---

### Task 1: Reprioritize the ambiguous TODO

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Split the single evaluation TODO into three concrete sub-items**

- Define:
  - derive name-based non-overwrite fallback labels
  - carry the same fallback into overwrite copy
  - evaluate whether future ultra-long item names need a stricter max-length clamp

**Step 2: Mark the first two items as the implementation targets for this heartbeat**

Run: `sed -n '1,80p' TODO.md`
Expected: `Active` lists the three items in priority order.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add a failing test for name-derived non-overwrite fallback**

```js
assert.equal(
  buildQuickSlotAutoAssignNotice(0, { assignedItemName: '生命药水' }),
  '快捷栏1：+生命'
);
```

**Step 2: Add a failing test for overwrite copy using derived labels**

```js
assert.equal(
  buildQuickSlotAutoAssignNotice(1, {
    didOverwrite: true,
    assignedItemName: '净化药剂',
    replacedItemName: '狂战油'
  }),
  '快捷栏2：狂战→净化'
);
```

**Step 3: Run the regression suite to verify RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in quick-slot auto-assign notice assertions because name-derived fallback is not implemented yet.

### Task 3: Implement the shared helper and runtime wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add the label resolver**

- Prefer explicit short labels.
- Otherwise derive a compact label from the item name by stripping generic suffixes and whitespace.
- Fall back to `道具` only when no usable label exists.

**Step 2: Update quick-slot notice generation**

- Pass `assignedItemName` and `replacedItemName` from the inventory click flow.
- Reuse the shared resolver for both assigned and replaced items.

**Step 3: Update docs/help copy**

- Replace `快捷栏N：+道具` examples with concrete name-derived examples.
- Document overwrite fallback examples that use derived labels.

**Step 4: Run the regression suite to verify GREEN**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Final verification and integration

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit and preserve the feature branch name**

```bash
git add TODO.md PROGRESS.log README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/plans/2026-03-07-quickslot-fallback-labels-design.md docs/plans/2026-03-07-quickslot-fallback-labels-plan.md
git commit -m "feat: refine quick-slot fallback labels"
git push origin HEAD:refs/heads/feat/auto-quickslot-fallback-labels
```

**Step 3: Merge to main and push**

Run:

```bash
git checkout main
git merge --ff-only <new-commit>
git push origin main
```

Expected: `main` contains the verified quick-slot fallback label changes and the feature branch remains on the remote.
