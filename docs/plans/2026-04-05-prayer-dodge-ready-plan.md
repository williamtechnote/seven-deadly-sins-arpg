# 复苏祷言体力兑现反馈 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give `复苏祷言` a short payoff cue on the dodge row when natural stamina regen truly restores `闪避 Space` to ready.

**Architecture:** Reuse the existing action-row readiness edge in `UIScene.updateHUD()`, but gate the cue to the dodge row only when the previous dodge segment still contained a stamina-gap label or preview. Store one short-lived player-owned cue and let `getCombatDodgeStatusLabel(now)` briefly swap `复苏+35%` to `复苏就绪` unless a higher-priority dodge-economy label is active.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the dodge payoff cue with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- a short prayer dodge-ready cue state on `Player`
- `getCombatDodgeStatusLabel(now)` returning `复苏就绪` during the cue window
- `UIScene.updateHUD()` arming the cue only when the previous dodge row still showed a stamina-gap state
- README / Help copy documenting the new cue

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing dodge-ready cue hooks/docs

### Task 2: Implement the minimal runtime cue

**Files:**
- Modify: `game.js`

**Step 1: Add cue state**

Store `prayerDodgeReadyCueUntil` on `Player` and expose `armPrayerDodgeReadyCue(now)`.

**Step 2: Update label resolution**

Teach `getCombatDodgeStatusLabel(now)` to return `复苏就绪` while the cue is active and dodge is actually ready, while preserving `游步` priority.

**Step 3: Arm cue from the readiness edge**

In `UIScene.updateHUD()`, when the dodge row newly becomes ready, only arm the cue if the previous dodge row text still contained `差体/预告`.

**Step 4: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Update docs and verification

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Create: `docs/plans/2026-04-05-prayer-dodge-ready-design.md`
- Create: `docs/plans/2026-04-05-prayer-dodge-ready-plan.md`

**Step 1: Update docs**

Document the new `复苏就绪` cue, move the TODO forward, and record the audit trail.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-prayer-dodge-ready`.
