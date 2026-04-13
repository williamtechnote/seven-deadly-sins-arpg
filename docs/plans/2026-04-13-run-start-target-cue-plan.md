# Run-Start Target Cue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Carry the hub portal Boss-posture framing into the first second of `LevelScene` with one shared run-start cue.

**Architecture:** Add one shared target-cue helper in `shared/game-core.js`, let `LevelScene` build a boss-aware target payload from its existing `bossKey`, show the cue once near player spawn, and lock the helper/runtime/doc wording with regression checks before implementation.

**Tech Stack:** Vanilla JavaScript, Phaser 3, shared game-core helpers, repo regression checks, Markdown docs

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-run-start-target-cue-design.md`
- Create: `docs/plans/2026-04-13-run-start-target-cue-plan.md`

**Step 1: Promote the heartbeat item**

Add the run-start target cue to `Active` and leave a follow-up evaluation item in `Next Up`.

**Step 2: Save the design**

Document why the feature uses one shared one-shot cue instead of a larger persistent HUD surface.

### Task 2: Write the failing regression slice

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Lock that the shared helper:

- returns `目标 色欲 · 稳拍反制` for `{ label: '色欲 幻梦花园', bossKey: 'lust' }`
- returns `目标 暴怒 · 回体扛压` for `{ label: '暴怒 熔岩锻炉', bossKey: 'wrath' }`
- stays silent when no `bossCue` is available

**Step 2: Add runtime assertions**

Lock that `LevelScene`:

- imports the new helper
- builds the boss-aware target payload from `bossKey`
- stores a one-shot run-start cue
- shows it once after scene start

**Step 3: Run the RED check**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper/export and `LevelScene` wiring do not exist yet.

### Task 3: Implement the shared helper and LevelScene cue

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Implement a helper that reuses the existing boss-target normalization and cue vocabulary, then export it.

**Step 2: Wire LevelScene**

Build the boss-aware target payload from `bossKey`, cache the resulting cue on scene create, and keep it one-shot.

**Step 3: Show the cue**

Display the cue near the player once shortly after the run starts, and stay silent when no cue exists.

**Step 4: Run the GREEN check**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Update README**

Document that the portal Boss posture now survives into the first second of the run as a one-shot cue.

**Step 2: Update the in-game help copy**

Keep the help overlay aligned with the same run-start contract.

**Step 3: Mark the TODO complete**

Move the heartbeat item into `Completed` with the cycle timestamp.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Commit and merge only after verification**

Commit on `feat/auto-run-start-target-cue`, merge into `main`, attempt to push `main`, keep the feature branch, and record blocker/fallback details precisely if the live repo or network still prevents a full upstream push.

**Step 3: Notify completion**

Run:

```bash
openclaw system event --text "Done: seven-deadly-sins-arpg heartbeat cycle finished" --mode now
```
