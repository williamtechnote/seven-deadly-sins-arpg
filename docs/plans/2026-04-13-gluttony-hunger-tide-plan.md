# Gluttony Hunger Tide Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a real phase-3 Gluttony hazard that turns the existing `留体拆潮` posture into a stamina-and-dodge test.

**Architecture:** Extend the existing boss data and telegraph metadata with a new `hungerTide` hazard, then implement one dedicated `_execHazard()` branch in `game.js` for alternating sludge walls. Lock the contract with regression checks first, then sync README / help / TODO / audit notes.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime, shared boss data tables, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-gluttony-hunger-tide-design.md`
- Create: `docs/plans/2026-04-13-gluttony-hunger-tide-plan.md`

**Step 1: Promote the new active TODO**

Make `深渊巨口 phase 3 饥潮奔涌` the active heartbeat item and queue one focused boss-variety follow-up under `Next Up`.

**Step 2: Save the design and plan docs**

Document why a new Gluttony hazard is higher leverage than another numbers-only buff or another copy-only cue.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared/data assertions**

Add checks that require:

- `BOSSES.gluttony` phase 3 to include `hungerTide`
- `ATTACK_DISPLAY_NAMES.hungerTide === '饥潮奔涌'`
- a dedicated counter hint and counter window
- `BOSS_ATTACK_STATUS_ON_HIT.hungerTide` to apply short `slow`
- `BOSS_ATTACK_TYPES.HAZARD` to include `hungerTide`

**Step 2: Add source-hook assertions**

Require `game.js` to expose an `else if (atk === 'hungerTide')` branch with:

- alternating wall directions
- staggered start timing
- moving sludge-wall graphics
- repeated hit-guard timing rather than one frame of damage

**Step 3: Run RED**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because `hungerTide` metadata and runtime logic do not exist yet.

### Task 3: Implement the Gluttony mechanic

**Files:**
- Modify: `data.js`
- Modify: `game.js`

**Step 1: Add the new attack contract**

Wire `hungerTide` into Gluttony phase 3 plus the localized name, hint, counter-window, status-on-hit, and hazard-type tables.

**Step 2: Add the hazard runtime**

Implement one `_execHazard()` branch that:

- roots the boss during the attack
- spawns three staggered sludge walls from alternating sides
- damages/slows on contact with a short repeat guard
- cleans up graphics before returning to the normal cooldown flow

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that Gluttony phase 3 now adds `饥潮奔涌`, a stamina-preservation wave test that literalizes `留体拆潮`.

**Step 2: Update help overlay**

Mirror the same contract in the in-game boss readability/help text.

### Task 5: Verify, ship, and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 2: Commit and merge**

Commit on `feat/auto-gluttony-hunger-tide`, fast-forward merge into `main`, keep the feature branch, and attempt to push `main`.

**Step 3: Append the mandatory audit line**

Record the chosen task, requested/actual branch, checks, merge status, push status, and the live-repo blocker/fallback details in `PROGRESS.log`.
