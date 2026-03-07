# Event Room Unknown-Type Fallback Copy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep resolved unknown-type event-room HUD output stable when the settlement text is missing.

**Architecture:** Extend the shared event-room HUD summary helper with a compact fallback settlement copy so the browser HUD and CLI regression checks stay aligned. Cover the new output with explicit unknown-type fixtures before changing the implementation.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Lock the missing-settlement behavior with failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add unknown-type resolved fixtures that expect:
- `buildRunEventRoomHudSummary(...).resolutionText === '结算待同步'`
- `buildRunEventRoomHudLines(...)` includes `已选: 封印索引 · 结算待同步`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new unknown-type missing-settlement assertions.

### Task 2: Implement the shared fallback copy

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Update the shared compact-resolution path so resolved unknown-type rooms with no stored settlement text return `结算待同步`, while existing known-type compact copy stays unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new unknown-type missing-settlement assertions and the existing suite.

### Task 3: Sync docs and task tracking

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Note that unknown/future event-room types keep `已选:` and fall back to `结算待同步` when settlement text is absent.

**Step 2: Update TODO**

Split the original TODO into three concrete subtasks, mark the first two complete, and leave the route-label fallback item active.

**Step 3: Commit**

```bash
git add docs/plans/2026-03-07-event-room-fallback-copy-design.md docs/plans/2026-03-07-event-room-fallback-copy-plan.md scripts/regression-checks.mjs shared/game-core.js README.md TODO.md PROGRESS.log
git commit -m "feat: add event room fallback copy"
```
