# Event Room Known-Type Fallbacks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep resolved known-type event-room HUD summaries stable when saved choice labels or settlement text are missing.

**Architecture:** Extend the shared event-room HUD summary builder so it synthesizes missing route/settlement fragments before `game.js` renders the lines. Lock the behavior with targeted CLI regression fixtures first so the formatter change is driven by red-green verification.

**Tech Stack:** JavaScript, Phaser 3 runtime, Node CLI regression checks

---

### Task 1: Seed heartbeat scope and docs

**Files:**
- Create: `docs/plans/2026-03-07-event-room-known-fallbacks-design.md`
- Create: `docs/plans/2026-03-07-event-room-known-fallbacks-plan.md`
- Modify: `TODO.md`

**Step 1: Record the scope**

Add three concrete Active TODO items for known-type fallback follow-ups, ordered so the first two can be implemented in this heartbeat.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the red cases**

Add fixtures that expect:
- `buildRunEventRoomHudSummary()` to return `['效果: 未知选项']` for a resolved blessing room whose stored label can no longer be recovered.
- `buildRunEventRoomHudLines()` to return `交易: 豪赌 · 结算待同步` for a resolved trade room whose settlement text is missing.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new known-type fallback assertions.

### Task 3: Implement the shared formatter fallback

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Allow resolved rooms of any type to synthesize `未知选项` when no chosen label can be recovered, and `结算待同步` when settlement text is missing but a resolved route summary still exists.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new assertions and the existing suite.

### Task 4: Sync docs, tracking, and audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs and tracking**

Describe the known-type fallback behavior in the README, then mark the first two TODO items complete while leaving the third queued.

**Step 2: Commit**

```bash
git add docs/plans/2026-03-07-event-room-known-fallbacks-design.md docs/plans/2026-03-07-event-room-known-fallbacks-plan.md TODO.md scripts/regression-checks.mjs shared/game-core.js README.md PROGRESS.log
git commit -m "feat: add event room known fallbacks"
```
