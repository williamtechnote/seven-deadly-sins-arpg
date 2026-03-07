# Quick-Slot Width-Weighted Clamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make quick-slot fallback notices clamp by estimated render width instead of raw glyph count so mixed-width labels preserve more meaning without widening the HUD.

**Architecture:** Extend the shared quick-slot notice clamp with a width-weight heuristic that treats ASCII / half-width glyphs as narrower than CJK glyphs. Keep the public notice API unchanged so browser runtime wiring and CLI regression checks stay aligned.

**Tech Stack:** Plain JavaScript, shared game-core helpers, source-based regression checks via `node scripts/regression-checks.mjs`

---

### Task 1: Reprioritize the remaining TODO into heartbeat-sized work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-quickslot-width-clamp-design.md`
- Create: `docs/plans/2026-03-07-quickslot-width-clamp-plan.md`

**Step 1: Split the single evaluation TODO into three concrete sub-items**

- Define:
  - width-weighted quick-slot clamp in shared logic
  - docs/help/regression sync for mixed-width examples
  - optional future Phaser text measurement follow-up

**Step 2: Keep only the final measurement question as the remaining Active follow-up**

Run: `sed -n '1,20p' TODO.md`
Expected: the first two sub-items are the current implementation targets and the third remains the only future follow-up.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add a mixed-width non-overwrite quick-slot notice assertion**

```js
assert.equal(
  buildQuickSlotAutoAssignNotice(0, { assignedItemName: 'HP恢复药剂' }),
  '快捷栏1：+HP恢复'
);
```

**Step 2: Add a mixed-width overwrite quick-slot notice assertion**

```js
assert.equal(
  buildQuickSlotAutoAssignNotice(1, {
    didOverwrite: true,
    assignedItemName: 'ST恢复药剂',
    replacedItemName: 'HP恢复药剂'
  }),
  '快捷栏2：HP恢复→ST恢复'
);
```

**Step 3: Tighten README/help assertions for the width-weighted rule**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current helper still truncates mixed-width labels using a fixed three-glyph limit and docs do not describe the new rule yet.

### Task 3: Implement the width-weighted clamp and docs sync

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Replace the glyph-count clamp with a width-weight helper**

- Count ASCII / half-width glyphs as narrow.
- Count CJK / full-width glyphs as wide.
- Preserve existing CJK truncation examples such as `圣疗秘…`.

**Step 2: Keep the shared quick-slot notice formats unchanged**

- non-overwrite: `快捷栏N：+<标签>`
- overwrite same label: `快捷栏N：同类 <标签>`
- overwrite different labels: `快捷栏N：<旧标签>→<新标签>`

**Step 3: Update README and help-overlay text with a mixed-width example**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and integrate the heartbeat change

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit and preserve the feature branch name remotely if local ref creation stays blocked**

```bash
git add TODO.md PROGRESS.log README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/plans/2026-03-07-quickslot-width-clamp-design.md docs/plans/2026-03-07-quickslot-width-clamp-plan.md
git commit -m "feat: refine quick-slot width clamp"
git push origin HEAD:refs/heads/feat/auto-quickslot-width-clamp
git push origin main
```

**Step 3: Merge to main**

Run: `git merge --ff-only <new-commit>`
Expected: no-op or fast-forward because the sandbox ref-lock fallback may require committing directly on `main`.
