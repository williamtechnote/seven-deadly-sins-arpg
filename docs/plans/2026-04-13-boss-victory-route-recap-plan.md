# Boss Victory Route Recap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the routed shrine/event-room segment at Boss victory with one shared recap line in the settlement stack.

**Architecture:** Add one shared Boss-victory recap helper in `shared/game-core.js`, resolve it from `BossScene` scene data, and append it to the existing victory detail lines before the defeat dialog handoff. Lock the helper output and scene usage with regression checks before implementation.

**Tech Stack:** Vanilla JavaScript, Phaser 3, repo regression checks

---

### Task 1: Queue the heartbeat item and docs

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-boss-victory-route-recap-design.md`
- Create: `docs/plans/2026-04-13-boss-victory-route-recap-plan.md`

**Step 1: Promote the heartbeat TODO**

Move the Boss-victory route recap item into `Active` and seed the next meaningful follow-up in `Next Up`.

**Step 2: Keep the scope narrow**

Make the TODO explicitly about settlement readability, not boss-behavior tuning.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Add assertions for:

- `buildRunEventEncounterBossVictoryRecap({ key: 'breather' }) === '缓冲路线 · 稳线收官'`
- `buildRunEventEncounterBossVictoryRecap({ key: 'pressure' }) === '高压路线 · 顶压收官'`
- `buildRunEventEncounterBossVictoryRecap({ key: 'windfall' }) === '淘金路线 · 带赏收官'`
- unknown / missing profiles stay silent

**Step 2: Add BossScene source assertions**

Add regression checks that:

- `BossScene` resolves the shared Boss-victory recap from `data.runEventEncounterProfile`
- the victory `lines` array appends the shared recap before rendering the detail text / dialog payload

**Step 3: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the new helper/export and runtime wiring do not exist yet.

### Task 3: Implement the shared helper and Boss victory wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Implement `buildRunEventEncounterBossVictoryRecap(profile, runEventRoom, poolOverride)` beside the other run-arc recap helpers and export it.

**Step 2: Resolve the helper in BossScene**

Store the shared Boss-victory recap in `BossScene.create()` from the passed routed encounter profile.

**Step 3: Append the recap to the victory settlement**

Push the shared recap into the victory detail `lines` array only when it exists.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync README and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the item complete**

Move the Boss-victory item to `Completed` with timestamp and seed the next follow-up in `Next Up`.

**Step 2: Update the README**

Document that routed encounter identity now survives through Boss victory settlement with one shared recap line.

**Step 3: Append the audit line**

Record task, requested/actual branch, exact checks, merge status, push status, and blocker/fallback details.

### Task 5: Verify, commit, merge, notify

**Files:**
- Modify: repo git state only after verification

**Step 1: Attempt repo policy flow**

Update `main`, create `feat/auto-boss-victory-route-recap`, and if the live repo blocks the flow, use the established temp-clone fallback without committing directly on live `main`.

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
