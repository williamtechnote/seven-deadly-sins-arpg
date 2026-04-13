# First-Combat Goal Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the boss-posture reminder alive through combat-opening seeds by appending a one-shot first-combat cue between the existing run-start and first-shrine surfaces.

**Architecture:** Add one shared helper in `shared/game-core.js` that derives a short first-combat cue from the current boss target, then wire `LevelScene` to cache and show it once when room 1 combat wakes up. Lock the behavior with regression checks first, then sync README/help/TODO/PROGRESS so the early-run ladder stays documented.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the heartbeat direction

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-first-combat-goal-refresh.md`
- Create: `docs/plans/2026-04-14-first-combat-goal-refresh-design.md`
- Create: `docs/plans/2026-04-14-first-combat-goal-refresh-plan.md`

**Step 1: Update the active TODO**

Promote `首战目标姿态补位` into `Active`, keep the boss-mechanic follow-up in `Next Up`, and add `corridor 过门目标桥接` as the explicit next gap after this heartbeat.

**Step 2: Save the design docs**

Record the rejected persistent-HUD approach and the chosen first-combat wake-up cue contract.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Write tests for a new shared helper that:

- returns `首战 稳拍反制` for Lust
- returns `首战 回体扛压` for Wrath
- stays silent without a boss-aware target

**Step 2: Extend runtime-source assertions**

Require `LevelScene` to import the helper, derive/cache the cue, track the one-shot state, and show it from a first-combat wake-up hook.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper and runtime wiring do not exist yet.

### Task 3: Implement the shared cue

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a helper that resolves first-combat cue text from the existing normalized portal target contract.

**Step 2: Wire LevelScene**

Cache the cue at scene creation, track whether it has already been shown, and trigger it once when room 1 combat wakes up on combat-opening seeds.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that combat-opening runs now get a one-shot `首战 ...` reminder between the run-start cue and the first shrine.

**Step 2: Update help overlay copy**

Keep the help text aligned with the README contract.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Commit, merge, push, and append the audit line**

Record task, branch, checks, merge status, and any blocker/fallback in `PROGRESS.log`.
