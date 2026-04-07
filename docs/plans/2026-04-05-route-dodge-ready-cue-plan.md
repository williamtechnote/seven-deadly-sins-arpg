# 游步修习闪避就绪提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let `战技圣坛` 的 `游步修习` briefly swap the dodge row to `游步就绪` when its reduced cooldown or stamina cost truly pushes `闪避 Space` back to ready.

**Architecture:** Reuse the existing action-HUD ready-edge detection in `UIScene.updateHUD()`. Add a short-lived player-side cue window for the dodge-economy route, gate it off the previous dodge-row text so it only fires from cooldown/stamina-gap/post-roll blocked states, and keep the persistent `游步-20%/-18%` label as the fallback. Lock the behavior with regression checks and sync README/TODO/help copy.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the cue with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- `buildCombatActionHudSummary()` rendering `游步就绪`
- `game.js` exposing and arming a dedicated combat-discipline dodge-ready cue window
- README / help-overlay copy describing the new payoff cue

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing combat-discipline ready cue/runtime hook/docs

### Task 2: Implement the route-specific ready cue

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

- add `disciplineDodgeReadyCueUntil`
- add `armDisciplineDodgeReadyCue(now)`
- have `getCombatDodgeStatusLabel(now)` prefer `游步就绪` while the cue window is active and dodge is truly ready
- arm that cue from the existing dodge ready edge only when the previous dodge row still showed cooldown, stamina gap, or post-roll preview

**Step 2: Update player-facing copy**

Describe the new `游步就绪` payoff cue in README and help overlay text.

**Step 3: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Close the heartbeat loop

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO**

Mark the route-specific dodge ready cue complete and promote the next adjacent follow-up.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-route-dodge-ready-cue`.
