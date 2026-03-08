# Event Prompt Text Measurement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generalize the viewport text clamp helper and apply Phaser-backed runtime measurement to the event-room encounter prompt so it stays visible near screen edges.

**Architecture:** Keep the shared clamp logic in `shared/game-core.js`, with the inventory-specific helper delegating to the new generic helper. In `game.js`, add a small LevelScene text measurement/cache helper and use it when refreshing the run-event prompt indicator. Update docs and regression checks alongside the code.

**Tech Stack:** Plain JavaScript, Phaser 3 text objects, shared `game-core` helpers, `node scripts/regression-checks.mjs`

---

### Task 1: Split the TODO into concrete rollout items

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-event-text-measure-design.md`
- Create: `docs/plans/2026-03-09-event-text-measure-plan.md`

**Step 1: Replace the broad evaluation-only item with three concrete candidates**

- generic viewport text clamp helper
- event-room prompt runtime measurement + cache
- later rollout to longer HUD summaries

**Step 2: Leave the third item active after this heartbeat**

Run: `sed -n '1,12p' TODO.md`
Expected: the first two items are completed and the third remains active.

### Task 2: Write failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add clamp-helper coverage for generic viewport offsets**

```js
assert.equal(getViewportTextClampX(940, 180, 1024), 834);
assert.equal(getViewportTextClampX(1990, 120, 1024, 10, 1024), 1918);
```

**Step 2: Add source assertions for event-room prompt measurement/clamping**

```js
/_measureLevelTextWidth\(text,\s*'runEventPrompt'/
/getViewportTextClampX\(this\.runEventRoomShrine\.x,\s*promptWidth,\s*this\.cameras\.main\.width,\s*12,\s*this\.cameras\.main\.worldView\.x\)/
```

**Step 3: Tighten README/help assertions for viewport-safe event-room prompts**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL before implementation because the new helper/export/docs/source hooks do not exist yet.

### Task 3: Implement the first two TODO items

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Generalize the shared clamp helper**

- add `getViewportTextClampX`
- preserve `getInventoryTooltipClampX` as a wrapper
- export both helpers

**Step 2: Measure and clamp the event-room prompt**

- add a LevelScene hidden Phaser text node + width cache
- measure the prompt by style role
- clamp the prompt within the active camera viewport

**Step 3: Update README and help text**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt branch/commit integration with fallback**

```bash
git checkout -b feat/auto-event-text-measure
git add TODO.md PROGRESS.log README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/plans/2026-03-09-event-text-measure-design.md docs/plans/2026-03-09-event-text-measure-plan.md
git commit -m "feat: clamp event prompts with measured text width"
git push origin HEAD:refs/heads/feat/auto-event-text-measure
git push origin main
```

If local branch creation is still blocked by ref-lock permissions, document the blocker and preserve the requested branch name remotely if push succeeds.
