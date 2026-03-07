# Healing Event-Room Double-Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep resolved healing-room HUD summaries on the explicit `未知选项 / 结算待同步` fallback when both persisted summary fragments are missing.

**Architecture:** Drive the change from CLI regressions first, then narrow the shared event-room HUD summary builder so the healing-room double-missing path no longer reconstructs a visible choice label from the live choice pool. `game.js` keeps consuming the shared helper output unchanged.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Record heartbeat scope

**Files:**
- Create: `docs/plans/2026-03-07-healing-fallback-sync-design.md`
- Create: `docs/plans/2026-03-07-healing-fallback-sync-plan.md`
- Modify: `TODO.md`

**Step 1: Seed the task list**

Split the remaining healing fallback work into three concrete Active TODO items so this heartbeat can implement the first two and leave an auditable trail.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the red fixtures**

Expect:
- `buildRunEventRoomHudSummary()` to return `['治疗: 未知选项']` when a resolved healing room keeps a valid choice key but loses both stored summary fragments.
- `buildRunEventRoomHudLines()` to return `治疗: 未知选项 · 结算待同步` for the same fixture.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new healing fallback assertions.

### Task 3: Implement the shared formatter change

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Detect the resolved healing-room path where both persisted summary fragments are empty and synthesize the visible choice label directly as `未知选项` before HUD lines are built.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new assertions and the existing suite.

### Task 4: Sync docs and audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the healing-room double-fallback behavior in the README and mark the finished TODO items complete.

**Step 2: Commit**

```bash
git add docs/plans/2026-03-07-healing-fallback-sync-design.md docs/plans/2026-03-07-healing-fallback-sync-plan.md TODO.md scripts/regression-checks.mjs shared/game-core.js README.md PROGRESS.log
git commit -m "feat: lock healing fallback summary"
```
