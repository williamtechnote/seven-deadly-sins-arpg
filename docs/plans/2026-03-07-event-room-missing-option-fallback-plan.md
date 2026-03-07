# Event Room Missing-Option Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep resolved unknown-type event-room HUD output stable when the chosen option label is missing.

**Architecture:** Extend the shared event-room HUD summary helper with a generic chosen-label fallback for unknown/future room types so the browser HUD and CLI regression checks stay aligned. Cover the new output with explicit unknown-type fixtures before changing the implementation.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Lock the missing-option-label behavior with failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add unknown-type resolved fixtures that expect:
- `buildRunEventRoomHudSummary(...).routeLines === ['已选: 未知选项']`
- `buildRunEventRoomHudLines(...)` includes `已选: 未知选项 · 金币+88`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new unknown-type missing-option-label assertions.

### Task 2: Implement the shared fallback label

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Update the shared resolved-route path so unknown-type rooms with no stored `selectedChoiceLabel` fall back to `未知选项`, while existing known-type formatting stays unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new missing-option-label assertions and the existing suite.

### Task 3: Sync docs and task tracking

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Note that unknown/future event-room types now fall back to `未知选项` when the stored choice label is absent, and still keep the generic `已选:` prefix.

**Step 2: Update TODO**

Split the original TODO into three concrete subtasks, mark the first two complete, and leave the full dual-fallback item active.

**Step 3: Commit**

```bash
git add docs/plans/2026-03-07-event-room-missing-option-fallback-design.md docs/plans/2026-03-07-event-room-missing-option-fallback-plan.md scripts/regression-checks.mjs shared/game-core.js README.md TODO.md PROGRESS.log
git commit -m "feat: add event room missing option fallback"
```
