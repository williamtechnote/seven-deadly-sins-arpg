# 迅击祷言冷却兑现反馈 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give `迅击祷言` a short payoff cue on the action HUD when `特攻 O` truly becomes ready.

**Architecture:** Reuse the existing action-row readiness edge in `UIScene.updateHUD()`. Arm one short-lived player-owned cue only when the prayer cooldown route is active, then let `getCombatSpecialStatusLabel(now)` briefly swap `迅击-22%` to `迅击就绪` unless a higher-priority `借势` window is live.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the payoff cue with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- a short prayer-ready cue state on `Player`
- `getCombatSpecialStatusLabel(now)` returning `迅击就绪` during the cue window
- `UIScene.updateHUD()` arming the cue from the same readiness edge that drives the generic ready flash
- README / Help copy documenting the new cue

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing prayer-ready cue hooks/docs

### Task 2: Implement the minimal runtime cue

**Files:**
- Modify: `game.js`

**Step 1: Add cue state**

Store `prayerSpecialReadyCueUntil` on `Player` and expose `armPrayerSpecialReadyCue(now)`.

**Step 2: Update label resolution**

Teach `getCombatSpecialStatusLabel(now)` to return `迅击就绪` while the cue is active and special is actually ready, while preserving `借势` priority.

**Step 3: Arm cue from the readiness edge**

In `UIScene.updateHUD()`, when the special row newly becomes ready, reuse that edge to arm the prayer cue.

**Step 4: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Update docs and verification

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Create: `docs/plans/2026-04-05-prayer-ready-flash-design.md`
- Create: `docs/plans/2026-04-05-prayer-ready-flash-plan.md`

**Step 1: Update docs**

Document the new `迅击就绪` cue, move the TODO forward, and record the audit trail.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-prayer-ready-flash`.
