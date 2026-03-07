# Event-Room World Label Settlement-Only Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve `房名 · 已结算` for resolved unknown or future event-room world labels when the live event definition is gone.

**Architecture:** Narrow the remaining umbrella TODO into concrete subtasks, add a failing regression for the orphaned-definition case, then let the shared world-label helper fall back to persisted room data when normalization cannot recover the event from the current pool.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Narrow the TODO scope

**Files:**
- Create: `docs/plans/2026-03-07-event-room-world-label-settlement-fallback-design.md`
- Create: `docs/plans/2026-03-07-event-room-world-label-settlement-fallback-plan.md`
- Modify: `TODO.md`

**Step 1: Split the umbrella TODO**

Replace the single Active item with three concrete follow-ups and target the first two this cycle.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the red case**

Expect:
- `buildRunEventRoomWorldLabelRouteLine()` to return an empty string for a resolved unknown/future room whose key no longer exists in the current pool.
- `buildRunEventRoomWorldLabel()` to return `谜藏书库 · 已结算` for the same orphaned saved room.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the world-label helper currently returns an empty string when normalization cannot recover the room definition.

### Task 3: Implement the minimal shared fix

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Keep the route-line helper behavior intact, and update `buildRunEventRoomWorldLabel()` so it falls back to persisted room fields when normalization fails.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new world-label assertions and the existing suite.

### Task 4: Sync docs and heartbeat audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the persisted-name `已结算` fallback, mark the first two TODO sub-items complete, and append the heartbeat audit line after verification.
