# 复苏祷言资源条临界提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the stamina bar briefly brighten when `复苏祷言` natural regen truly pushes `闪避 Space` back across the dodge-ready threshold.

**Architecture:** Reuse the existing dodge-ready edge in `UIScene.updateHUD()` and piggyback on the shared stamina payoff pulse instead of inventing a new bar effect. Gate the cue to the same prior-state check that already protects `复苏就绪`, so the bar only reacts when the previous dodge row still showed a stamina-gap or preview.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the threshold cue with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- `UIScene.updateHUD()` arming `armStaminaPayoffPulse(1)` on the same dodge threshold edge that already arms `armPrayerDodgeReadyCue()`
- README / Help copy describing the stamina-bar threshold cue

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing prayer threshold pulse/docs

### Task 2: Implement the shared threshold cue

**Files:**
- Modify: `game.js`

**Step 1: Write minimal implementation**

Inside the dodge-ready edge, after confirming the previous dodge row still contained `差`, call `this.armStaminaPayoffPulse(1)` next to `player.armPrayerDodgeReadyCue(this.time.now)`.

**Step 2: Update player-facing copy**

Extend README and help-overlay prayer text so `复苏祷言` explicitly says the stamina bar also briefly brightens at the threshold.

**Step 3: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Close the heartbeat loop

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO**

Mark the prayer threshold cue done and promote the next adjacent dodge-readiness follow-up.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-prayer-stamina-threshold-cue`.
