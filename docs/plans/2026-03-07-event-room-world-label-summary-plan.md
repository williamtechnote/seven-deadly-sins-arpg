# Event-Room World Label Summary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show the resolved chosen-route short summary directly on the in-world event-room altar label while preserving the existing fallback wording.

**Architecture:** Add regression coverage first for a shared world-label helper, then implement that helper in `shared/game-core.js` by reusing the existing HUD summary output. `game.js` consumes the helper so the world-space label and HUD formatting stay synchronized.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Record the narrowed heartbeat scope

**Files:**
- Create: `docs/plans/2026-03-07-event-room-world-label-summary-design.md`
- Create: `docs/plans/2026-03-07-event-room-world-label-summary-plan.md`
- Modify: `TODO.md`

**Step 1: Seed the follow-up items**

Split the single remaining Active TODO into three concrete altar world-label sub-items and select the first two for this heartbeat cycle.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the red cases**

Expect:
- `buildRunEventRoomWorldLabel()` to return `祈愿圣坛 · 效果: 迅击祷言` for a resolved blessing room with a stored chosen label.
- `buildRunEventRoomWorldLabel()` to return `祈愿圣坛 · 效果: 未知选项` when the resolved blessing room loses its stored chosen label.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the world-label helper does not exist yet.

### Task 3: Implement the shared formatter and wire the scene

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Export `buildRunEventRoomWorldLabel()` from `shared/game-core.js`, derive the resolved route snippet from the shared HUD summary, and use the helper when refreshing the altar label in `game.js`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new world-label assertions and the existing suite.

### Task 4: Sync docs and audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new altar world-label summary behavior in the README and mark the first two TODO sub-items complete, leaving the unknown-type follow-up active.

**Step 2: Commit**

```bash
git add docs/plans/2026-03-07-event-room-world-label-summary-design.md docs/plans/2026-03-07-event-room-world-label-summary-plan.md TODO.md scripts/regression-checks.mjs shared/game-core.js game.js README.md PROGRESS.log
git commit -m "feat: sync event room world labels"
```
