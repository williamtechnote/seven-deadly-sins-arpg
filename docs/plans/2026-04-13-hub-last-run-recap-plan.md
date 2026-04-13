# Hub Last-Run Recap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve one compact `上轮战报` recap in the hub after Boss victory so the player can still read which route shaped the last run segment.

**Architecture:** Extend shared save-data normalization with a `lastRunSummary` payload, add a shared formatter for hub recap lines, persist the payload at Boss victory, and render a small fixed-position panel in `HubScene`. Lock helper output, save/load stability, runtime wiring, and README coverage with regression checks.

**Tech Stack:** Vanilla JavaScript, Phaser 3, repo regression checks

---

### Task 1: Queue the heartbeat item and docs

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-hub-return-memory-bridge.md`
- Create: `docs/plans/2026-04-13-hub-last-run-recap-design.md`
- Create: `docs/plans/2026-04-13-hub-last-run-recap-plan.md`

**Step 1: Promote the heartbeat TODO**

Add a new `Active` item focused on hub-visible last-run recap readability.

**Step 2: Keep the scope narrow**

Make the item about a lightweight persisted hub memory bridge, not a full end-of-run report.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Verify the new helper keeps:

- a visible title plus three lines when boss/route/source are present
- a two-line fallback when only boss and route exist
- a hidden/empty result when no meaningful recap exists

**Step 2: Extend save/load integrity**

Verify `serializeSaveData` / `deserializeSaveData` preserve the persisted `lastRunSummary` payload.

**Step 3: Add runtime-source assertions**

Verify:

- `BossScene` writes `GameState.lastRunSummary` before saving on victory
- `HubScene` renders a dedicated fixed-position recap block from the shared helper

**Step 4: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the new save payload/helper/runtime wiring does not exist yet.

### Task 3: Implement the shared summary and hub panel

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Extend save normalization**

Add a normalized `lastRunSummary` payload to defaults, save serialization, and deserialization.

**Step 2: Add the shared formatter**

Implement a helper that converts the payload into a small `上轮战报` block with stable line fallbacks.

**Step 3: Persist the summary at Boss victory**

Populate `GameState.lastRunSummary` from boss metadata, the shared Boss-victory recap, and the selected route source before `GameState.save()`.

**Step 4: Render the hub block**

Show the recap in `HubScene` with a fixed-position panel that does not interfere with portal or minimap reading.

**Step 5: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync README and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the item complete**

Move the hub recap item to `Completed` with timestamp and seed the next follow-up.

**Step 2: Update the README**

Document that the hub now preserves the last routed segment as a compact `上轮战报`.

**Step 3: Append the audit line**

Record task, requested/actual branch, exact checks, merge status, push status, and blocker/fallback details.

### Task 5: Verify, commit, merge, push

**Files:**
- Modify: repo git state only after verification

**Step 1: Use the required repo flow**

Attempt live `main` update and feature-branch creation first; if blocked by the existing dirty workspace or ref-lock permissions, use the established temp-clone fallback.

**Step 2: Run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit and merge only after verification**

Commit on `feat/auto-hub-last-run-recap`, merge into `main`, attempt to push `main`, keep the feature branch, and record any blocker/fallback precisely in `PROGRESS.log`.
