# Event Room Dual-Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep resolved unknown-type event-room HUD output stable when both the stored option label and settlement text are missing.

**Architecture:** Add the combined fallback in the shared event-room HUD summary helper so browser HUD rendering and CLI regressions use the same output contract. Lock the behavior with explicit unknown-type fixtures before changing the formatter.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Lock the dual-fallback path with failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add unknown-type resolved fixtures that expect:
- `buildRunEventRoomHudSummary(...).routeLines === ['已选: 未知选项']`
- `buildRunEventRoomHudSummary(...).resolutionText === '结算待同步'`
- `buildRunEventRoomHudLines(...)` includes `已选: 未知选项 · 结算待同步`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new dual-fallback assertions.

### Task 2: Implement the shared dual fallback

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Update the shared resolved unknown-type path so it synthesizes `未知选项` and `结算待同步` independently, allowing the merged HUD line to remain stable even when both fields are absent.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new assertions and the existing suite.

### Task 3: Sync docs and task tracking

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Note that unknown/future event-room summaries now keep the full `已选: 未知选项 · 结算待同步` fallback even when both persisted fragments are missing.

**Step 2: Update TODO**

Split the original TODO into three concrete subtasks, mark the first two complete, and keep the tracking aligned with the new fallback wording.

**Step 3: Commit**

```bash
git add docs/plans/2026-03-07-event-room-double-fallback-design.md docs/plans/2026-03-07-event-room-double-fallback-plan.md scripts/regression-checks.mjs shared/game-core.js README.md TODO.md PROGRESS.log
git commit -m "feat: add event room dual fallback"
```
