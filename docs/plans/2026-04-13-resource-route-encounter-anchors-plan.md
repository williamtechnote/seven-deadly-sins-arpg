# Resource-Route Encounter Anchors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the routed room-3 anchor ladder to prayer, gambler, and supply routes so resource/settlement choices keep a route-specific combat identity after selection.

**Architecture:** Reuse the existing shared encounter feedback ladder in `shared/game-core.js`. Add six baseline route anchors plus one selective recommendation override for `稳押`, then keep `game.js`, README, and regression coverage aligned to the same entry/clear/source-cue contract.

**Tech Stack:** Plain JavaScript shared helpers, Phaser scene help text in `game.js`, CLI regression checks in `scripts/regression-checks.mjs`.

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-resource-route-encounter-anchors-design.md`
- Create: `docs/plans/2026-04-13-resource-route-encounter-anchors-plan.md`

**Step 1: Reprioritize TODO**

- move the landed action-route recommendation item into `Completed`
- promote the resource-route anchor gap to `Active`
- queue the follow-up about narrower resource-route recommendation echoes behind it

**Step 2: Save design and plan docs**

- lock the exact baseline anchor strings for prayer / gambler / supply routes
- lock the single recommendation-specific override for `稳押`

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add red assertions**

Cover:

- baseline entry / clear / source-cue anchors for `复苏祷言 / 迅击祷言 / 豪赌 / 稳押 / 战地净化包 / 狂战补给`
- `稳押` persisting `当前更宜稳押` and upgrading the routed encounter echo to `留本追赏`
- README / help overlay documenting the new resource-route anchor contract

**Step 2: Verify RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new resource-route encounter assertions.

### Task 3: Implement the shared encounter feedback

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add baseline route feedback**

- extend `RUN_EVENT_BASELINE_ROUTE_FEEDBACK` with the six resource-route anchors
- reuse the existing profile-key guard and source-cue moments (`stabilize` / `engage` / `bounty`)

**Step 2: Add the selective recommendation override**

- teach `getRunEventEncounterRecommendationFeedback` that `carefulWager + 当前更宜稳押` should surface `留本追赏`
- keep existing recommendation-specific overrides higher priority than baseline anchors

**Step 3: Verify GREEN**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new resource-route encounter assertions.

### Task 4: Sync docs and help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update README**

- explain that prayer / gambler / supply routes now carry route-specific room-3 anchors
- include the new cue examples alongside the existing encounter-routing copy

**Step 2: Update help overlay text**

- mention the new resource-route anchor examples in the in-game help copy
- keep the wording aligned with README and shared helper output

**Step 3: Re-run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with docs/help regex coverage still green.

### Task 5: Verify, audit, and ship with git fallback

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

**Step 2: Attempt the requested git flow**

- commit on `feat/auto-resource-route-anchors`
- fast-forward merge into updated `main`
- attempt to push the feature branch and `main`
- if push is blocked, record the exact blocker and fallback in `PROGRESS.log`
