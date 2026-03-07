# Event-Room World Label Generic Prefix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve the generic `已选:` world-label prefix for resolved unknown or future event-room types.

**Architecture:** Split the remaining TODO into concrete follow-ups, add regression coverage first, then make the shared world-label helper explicitly consume a dedicated resolved route-line helper so the altar label inherits the same fallback semantics as the HUD.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Narrow the heartbeat scope

**Files:**
- Create: `docs/plans/2026-03-07-event-room-world-label-generic-prefix-design.md`
- Create: `docs/plans/2026-03-07-event-room-world-label-generic-prefix-plan.md`
- Modify: `TODO.md`

**Step 1: Split the TODO**

Replace the single Active altar-label fallback item with three concrete unknown/future-type follow-ups and target the first two in this cycle.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the red cases**

Expect:
- `buildRunEventRoomWorldLabel()` to return `谜藏书库 · 已选: 封印索引` for a resolved unknown room with a persisted route label.
- `buildRunEventRoomWorldLabel()` to return `谜藏书库 · 已选: 未知选项` when that persisted route label is missing.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the dedicated world-label route-line helper does not exist yet.

### Task 3: Implement the shared helper

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add a helper that returns the resolved world-label route line from `buildRunEventRoomHudSummary()`, then let `buildRunEventRoomWorldLabel()` consume that helper.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new unknown/future world-label assertions and the existing suite.

### Task 4: Sync docs and audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the generic `已选:` altar-label fallback for unknown/future room types, mark the first two TODO sub-items complete, and leave the README/TODO aligned on the remaining follow-up.
