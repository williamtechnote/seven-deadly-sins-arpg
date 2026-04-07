# 连斩修习普攻就绪提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let `战技圣坛` 的 `连斩修习` briefly swap the `普攻 U` row to `连斩就绪` when reduced attack cooldown truly pushes the normal attack from cooldown back to ready.

**Architecture:** Mirror the existing route-specific payoff cue pattern already used by `游步修习` and `祈愿圣坛`. Add a short-lived player-side cue window for the attack route, arm it from the same action-HUD readiness edge only when the previous attack row was still cooldown-blocked or previewing a post-roll cooldown state, and keep the persistent `连斩-18%` label as the steady fallback. Lock the behavior with regression coverage, then sync README/TODO/PROGRESS.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Repair and extend the regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- add summary coverage for `连斩就绪`
- add source-hook assertions for a dedicated combat-discipline attack-ready cue window
- add README/help-overlay assertions for the new payoff cue

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing attack ready cue/docs, not on test syntax

### Task 2: Implement the cue

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

- add `disciplineAttackReadyCueUntil`
- add `armDisciplineAttackReadyCue(now)`
- have `getCombatAttackStatusLabel(now)` prefer `连斩就绪` while the cue window is active and attack is truly ready
- arm that cue from the existing attack ready edge only when the previous attack row still showed cooldown or post-roll cooldown preview

**Step 2: Update player-facing copy**

Describe the short `连斩就绪` payoff cue in README and help overlay text.

### Task 3: Close the heartbeat loop

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update heartbeat docs**

Mark the active TODO complete and append the mandatory audit line.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-attack-ready-cue`.
