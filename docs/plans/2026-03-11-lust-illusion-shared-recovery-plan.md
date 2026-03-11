# Lust Illusion + Shared Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the remaining Lust phase-3 pacing observation into three concrete TODO items, then implement the first two by extending `illusion` recovery and the shared `majorSpecial` recovery guard.

**Architecture:** Keep the change narrow and additive on top of the current working tree. Lock the new contracts in `scripts/regression-checks.mjs` first, watch them fail, then update `game.js`, `data.js`, `README.md`, `TODO.md`, and the heartbeat audit trail.

**Tech Stack:** Phaser 3, plain JavaScript, Node.js regression script

---

### Task 1: Document the inferred design

**Files:**
- Create: `docs/plans/2026-03-11-lust-illusion-shared-recovery-design.md`
- Create: `docs/plans/2026-03-11-lust-illusion-shared-recovery-plan.md`

**Step 1: Save the design and plan docs**

Write the inferred non-interactive design and this execution plan into `docs/plans/`.

**Step 2: Verify the files exist**

Run: `ls docs/plans | rg 'lust-illusion-shared-recovery'`
Expected: both new plan files are listed.

### Task 2: Write the failing recovery regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Raise the `illusion` recovery expectation**

Update the test to expect `const recoveryMs = 1040;` in the `illusion` executor branch.

**Step 2: Raise the shared recovery expectation**

Update the test to expect `sharedAttackRecoveryMs.majorSpecial === 3900`.

**Step 3: Tighten README wording expectations**

Update the README regex checks so they describe the new `illusion`-first pass and the follow-up shared recovery pass.

**Step 4: Run the regression script to verify RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the source still contains the older `illusion` and shared recovery values.

### Task 3: Implement the minimal pacing changes

**Files:**
- Modify: `game.js`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Extend `illusion` recovery**

Raise `const recoveryMs` in the `illusion` branch from `920` to `1040`.

**Step 2: Extend shared major-special recovery**

Raise `BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial` from `3600` to `3900`.

**Step 3: Sync player-facing wording**

Update the README paragraph so it describes the new `illusion` recovery pass and the newly repeated shared recovery pass.

**Step 4: Split the active TODO**

Mark `二十六-三` complete as split into `二十七-一 / 二十七-二 / 二十七-三`, record `二十七-一` and `二十七-二` as completed for this timestamp, and leave `二十七-三` active as the new observation.

### Task 4: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required checks**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt git delivery**

Run the required commit / merge / push sequence. If git lock errors block local branch, index, commit, or merge writes, try at least one fallback path and record the blocker explicitly.

**Step 3: Append heartbeat audit**

Add a `PROGRESS.log` line with tasks, branch, tests, merge/push status, blocker, and fallback details.
