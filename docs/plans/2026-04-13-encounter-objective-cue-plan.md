# Encounter Objective Cue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a one-shot room-3 objective cue that turns routed encounter identity into an immediate first-action prompt.

**Architecture:** Keep the contract in `shared/game-core.js` with a new helper that maps encounter profiles to short objective copy. `LevelScene` should reuse the existing room-3 entry-announcement path and schedule a delayed follow-up cue instead of inventing a new HUD surface. Lock helper/runtime/docs with regression checks first.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the heartbeat direction

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-room-entry-objective-ladder.md`
- Create: `docs/plans/2026-04-13-encounter-objective-cue-design.md`
- Create: `docs/plans/2026-04-13-encounter-objective-cue-plan.md`

**Step 1: Promote the new TODO**

Add the room-3 objective cue as the current active heartbeat item and queue a short follow-up evaluation note.

**Step 2: Save the methodology/design/plan docs**

Record why the new cue should stay one-shot, helper-driven, and tied to the routed encounter profile.

### Task 2: Write the failing regression slice

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Lock a new shared helper that returns:

- `breather` -> `先稳前排`
- `pressure` -> `先拆夹角`
- `windfall` -> `先盯后排`
- unknown -> `''`

**Step 2: Add runtime/doc assertions**

Require `game.js` to import the helper, track one-shot delivery, and schedule the delayed follow-up cue from the existing room-3 entry announcement path. Add README/help overlay assertions for the new contract.

**Step 3: Run regression checks and verify RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper export and runtime/doc usage do not exist yet.

### Task 3: Implement the minimal feature

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export `buildRunEventEncounterObjectiveCue(profile)` from `shared/game-core.js`.

**Step 2: Wire LevelScene**

Import the helper, track whether the objective cue has already been shown for the current routed profile, and schedule a delayed floating-text follow-up after the entry preview fires.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README/help copy**

Document that routed room-3 identity now resolves into a short first-action cue.

**Step 2: Close the TODO**

Move the active item to `Completed` and keep a follow-up evaluation note in `Next Up`.

### Task 5: Verify and close

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt branch integration**

Commit on `feat/auto-encounter-objective-cue`, merge into `main`, push `main`, keep the feature branch, and record the audit line plus any fallback/blocker details.
