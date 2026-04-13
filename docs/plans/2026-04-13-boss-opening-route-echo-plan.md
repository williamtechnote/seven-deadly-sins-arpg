# Boss Opening Route Echo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Carry routed event-room identity into the first beat of the boss fight with one shared boss-opening echo.

**Architecture:** Add one shared boss-opening helper in `shared/game-core.js`, pass the routed encounter profile from `LevelScene` into `BossScene` on the Boss-door transition, and show a one-shot opener cue in `BossScene`. Lock the helper output, scene handoff, and docs wording with regression coverage before implementation.

**Tech Stack:** Vanilla JavaScript, Phaser 3, repo regression checks

---

### Task 1: Queue the heartbeat item and docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`
- Create: `docs/plans/2026-04-13-boss-opening-route-echo-design.md`
- Create: `docs/plans/2026-04-13-boss-opening-route-echo-plan.md`

**Step 1: Make the new heartbeat item active**

Add an `Active` TODO for the Boss-opening route echo and move the follow-up to `Next Up`.

**Step 2: Keep the README/help wording scoped**

Document that routed encounter identity now reaches the first beat of the boss fight through one shared opener cue.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper expectations**

Add assertions for:

- `buildRunEventEncounterBossOpeningEcho({ key: 'breather' }) === '缓冲路线 · 稳线开局'`
- `buildRunEventEncounterBossOpeningEcho({ key: 'pressure' }) === '高压路线 · 抢势开局'`
- `buildRunEventEncounterBossOpeningEcho({ key: 'windfall' }) === '淘金路线 · 带赏开局'`
- unknown / missing profiles stay silent

**Step 2: Add scene-glue expectations**

Add regression checks that:

- `LevelScene` passes `runEventEncounterProfile` into `BossScene`
- `BossScene` resolves the shared opener cue from scene data
- `BossScene` shows the opener only once and only when the helper returns text

**Step 3: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the new helper/export and runtime wiring do not exist yet.

### Task 3: Implement the shared helper and scene handoff

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Implement `buildRunEventEncounterBossOpeningEcho(profile, runEventRoom, poolOverride)` beside the existing encounter recap helpers and export it.

**Step 2: Pass the profile into the boss scene**

When the Boss door is entered from `LevelScene`, pass the current routed encounter profile in the `scene.start('BossScene', ...)` payload.

**Step 3: Show the boss-opening echo once**

In `BossScene`, resolve the opener line from the passed profile and show one shared floating cue near fight start. Keep it one-shot and silent when no route exists.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync README and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the implemented TODO complete**

Move the Boss-opening item to `Completed` with timestamp and seed the next meaningful follow-up in `Next Up`.

**Step 2: Append the audit line**

Record task, requested/actual branch, exact checks, merge status, and any blocker/fallback details.

### Task 5: Verify, commit, merge, notify

**Files:**
- Modify: repo git state only after verification

**Step 1: Attempt repo policy flow**

Update `main`, create `feat/auto-boss-opening-route-echo`, and if the live repo blocks the flow, use the established temp-clone fallback without committing directly on live `main`.

**Step 2: Run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit and merge only after verification**

Commit on the feature branch, fast-forward merge into `main`, attempt `push main`, keep the feature branch, and then run:

```bash
openclaw system event --text "Done: seven-deadly-sins-arpg heartbeat cycle finished" --mode now
```
