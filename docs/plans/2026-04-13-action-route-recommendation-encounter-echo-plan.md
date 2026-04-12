# Action-Route Recommendation Encounter Echo Implementation Plan

**Goal:** Let the action-route recommendation reasons survive into routed room-3 entry / clear / source cues so the next combat beat explains not just route identity, but also why that route was recommended now.

**Architecture:** Extend the existing recommendation-first encounter feedback helper in `shared/game-core.js` with explicit action-route reason mappings. Keep `game.js` on the current shared-helper contract, then update README/help copy and the heartbeat audit after verification.

**Tech Stack:** Plain JavaScript shared helpers, Phaser scene glue, CLI regression checks.

### Task 1: Lock the backlog and design trail

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-action-route-recommendation-encounter-echo-design.md`
- Create: `docs/plans/2026-04-13-action-route-recommendation-encounter-echo-plan.md`

**Step 1: Reprioritize TODO**

- move the landed resource-route anchor work to `Completed`
- promote the action-route recommendation encounter-echo gap to `Active`
- keep narrower resource/build recommendation follow-ups in `Next Up`

**Step 2: Save design + implementation notes**

- lock the action route + reason + profile mapping table
- lock the fallback order: recommendation-specific echo first, baseline anchor second

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Cover:

- action-route recommendation receipts producing the new entry / clear echoes
- the same receipts producing the new source cue on the correct routed combat beat
- baseline anchors still winning when no recommendation receipt exists

**Step 2: Add doc assertions**

Extend README/help regex checks so they fail until the new action recommendation encounter contract is documented.

**Step 3: Verify RED**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: FAIL on the new action-route recommendation encounter assertions.

### Task 3: Implement the shared encounter feedback

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add action recommendation encounter mappings**

- extend `getRunEventEncounterRecommendationFeedback(...)` with explicit action-route reason/profile cases
- keep the new action mappings narrower than the baseline anchors

**Step 2: Preserve fallback behavior**

- matching recommendation reason returns the new narrower echo
- missing or weak recommendation still falls through to `RUN_EVENT_BASELINE_ROUTE_FEEDBACK`

**Step 3: Verify GREEN**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: PASS for the new action-route encounter assertions.

### Task 4: Sync docs and help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

- document that action-route recommendations now continue into routed room-3 feedback
- include the narrower action echo examples without bloating the intro copy

**Step 2: Update help overlay**

- mirror the same contract in the event-room guidance block

**Step 3: Re-run regression checks**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: PASS with docs/help assertions green.

### Task 5: Verify and close the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Attempt the repo git workflow with fallback**

- try the required `main` update and feature-branch creation first
- if the live workspace still blocks those writes, mirror the verified files into a temp clone on top of the latest available `origin/main`
- commit on `feat/auto-action-route-encounter-echo`
- fast-forward merge into temp-clone `main`
- attempt pushes if the environment permits

**Step 3: Append the mandatory audit line**

- record task, requested/actual branch, checks, merge status, push status, blocker, and fallback
