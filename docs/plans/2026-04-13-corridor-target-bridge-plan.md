# Corridor Target Bridge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve the boss-posture objective through the quiet corridor after a combat-opening first room by showing one compact bridge cue before shrine proximity.

**Architecture:** Add a shared corridor-target cue helper in `shared/game-core.js`, then let `LevelScene` cache that cue, track the first corridor bounds, and announce it once only after room 1 is cleared and the player first crosses into the corridor. Lock the helper, runtime hook, and docs wording with regression checks first.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock scope and backlog

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-corridor-target-bridge.md`
- Create: `docs/plans/2026-04-13-corridor-target-bridge-design.md`
- Create: `docs/plans/2026-04-13-corridor-target-bridge-plan.md`

**Step 1: Reframe the active TODO**

Turn the broad follow-up evaluation into the concrete heartbeat target: a one-shot corridor bridge cue instead of more persistent HUD.

**Step 2: Queue the next follow-up**

Add a narrow follow-up about whether a separate room-clear cue is still needed after the corridor bridge lands.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Require a new shared helper that:

- returns `过门 稳拍反制` for Lust
- returns `过门 回体扛压` for Wrath
- stays silent for legacy or missing targets

**Step 2: Add runtime-hook assertions**

Require `LevelScene` to:

- import the helper
- cache the cue on scene creation
- track the first corridor bounds and the one-shot shown flag
- trigger the cue only after room 1 is fully cleared and the player first enters corridor 1

**Step 3: Extend docs assertions**

Require README and the help overlay to mention the new `过门 ...` cue alongside the existing portal/run-start/first-combat/shrine ladder.

**Step 4: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper, runtime hook, and user-facing copy do not exist yet.

### Task 3: Implement the corridor bridge

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a helper that derives the compact corridor-entry cue from the normalized boss target.

**Step 2: Wire LevelScene**

Cache the cue during scene creation, store corridor 1 bounds, and announce the cue once when the player crosses into corridor 1 after room-1 clear.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that combat-opening seeds now restate the boss posture again through a one-shot `过门 ...` cue while crossing the first corridor.

**Step 2: Update help overlay copy**

Extend the early-run explanation so the help text matches README/runtime wording.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt git integration and append audit**

Attempt the required feature-branch workflow, then record task, requested branch, actual branch state, checks, merge status, push status, blocker, and fallback in `PROGRESS.log`.
