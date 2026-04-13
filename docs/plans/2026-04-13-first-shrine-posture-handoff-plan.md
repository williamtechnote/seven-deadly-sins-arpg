# First Shrine Posture Handoff Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the boss-posture reminder alive until the first unresolved shrine approach by appending a compact target cue to the shrine prompt and world label.

**Architecture:** Add a shared helper in `shared/game-core.js` that derives shrine-facing target posture copy from the current boss target, then thread that helper through `buildRunEventRoomPromptLabel()`, `buildRunEventRoomWorldLabel()`, and the `LevelScene` refresh paths. Lock the behavior with regression tests first, then sync README/help copy and heartbeat bookkeeping.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the heartbeat direction

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-early-run-goal-refresh.md`
- Create: `docs/plans/2026-04-13-first-shrine-posture-handoff-design.md`
- Create: `docs/plans/2026-04-13-first-shrine-posture-handoff-plan.md`

**Step 1: Prioritize the TODO**

Promote `首个事件房姿态接力` into `Active`, keep the older evaluation note in `Next Up`, and record that this cycle is extending the run-start target cue into the first shrine decision surface.

**Step 2: Save the design and methodology docs**

Capture the rejected persistent-HUD approach, the recommended shrine-surface handoff, and the objective-reminder rationale.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Write tests for a new shared helper that:

- returns `{ promptCue: '稳拍反制', worldLabelCue: '目标 稳拍反制' }` for Lust
- returns `{ promptCue: '回体扛压', worldLabelCue: '目标 回体扛压' }` for Wrath
- stays silent for unknown targets

**Step 2: Extend shrine-label assertions**

Update unresolved prompt/world-label checks so they fail until unresolved shrines append the new posture reminder when a boss target is supplied.

**Step 3: Extend runtime source assertions**

Require `LevelScene` to pass the current boss target into both prompt/world-label helper calls.

**Step 4: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the shared helper and runtime wiring do not exist yet.

### Task 3: Implement the shared handoff

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a helper that resolves compact shrine-facing target posture text from the existing boss target contract.

**Step 2: Extend shrine helpers**

Allow unresolved prompt/world-label builders to append the target cue when present, while leaving resolved and unknown-room behavior unchanged.

**Step 3: Thread LevelScene state**

Pass the current boss target into initial shrine creation and ongoing refresh/update paths.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that the portal/run-start boss posture can now persist into the first unresolved shrine approach as a compact reminder.

**Step 2: Update help overlay copy**

Extend the existing explanation so it mentions the first-shrine reminder without diverging from the README contract.

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
