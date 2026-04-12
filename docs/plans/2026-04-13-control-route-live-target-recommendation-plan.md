# Control-Route Live Target Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `镇步 / 破势` recommendations react to recent slowed-target and finisher-window context, then carry those reasons into routed room-3 encounter feedback.

**Architecture:** Add a small recent-control context payload to the choice-panel preview state in `game.js`, then let `shared/game-core.js` translate that payload into recommendation reasons and routed encounter echoes. Keep the runtime memory short-lived and scene-local while the shared helper remains the single source of truth for recommendation copy and echo mapping.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-control-route-live-target-recommendation-design.md`
- Create: `docs/plans/2026-04-13-control-route-live-target-recommendation-plan.md`

**Step 1: Update the active TODO**

- refine the active `镇压路线 live target recommendation` item with the exact recommendation / echo strings

**Step 2: Save the design + plan docs**

- record the recent-control context payload and the new reason / echo mapping

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add red assertions**

Cover:

- `镇步修习` recommending `先挂减速`
- `破势修习` recommending `减速目标已现`
- `破势修习` recommending `可接破势终结`
- persisted recommendation reason for the selected `破势修习`
- routed entry / clear / source-cue upgrades to `减速稳场 / 减速追赏 / 终结追赏`
- `game.js` preview-state plumbing for the new control-context fields
- README / help overlay copy for the new control-route recommendation contract

**Step 2: Verify RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the new control-route recommendation / echo assertions.

### Task 3: Implement the shared control-route logic

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Extend recommendation context**

- add a small helper for recent slowed-target / finisher-window state
- teach `getRunEventRoomChoiceActionStateNote` to emit `先挂减速 / 减速目标已现 / 可接破势终结`

**Step 2: Extend routed encounter echoes**

- map those reasons to `减速稳场 / 减速追赏 / 终结追赏`
- keep baseline anchors as the fallback when no high-confidence recommendation reason exists

### Task 4: Implement runtime preview-state plumbing

**Files:**
- Modify: `game.js`

**Step 1: Track short-lived control context**

- add short timers for recent slowed-target and finisher-window context
- arm them from existing slowed-hit / boss-finisher runtime hooks

**Step 2: Feed the choice panel and settlement state**

- include the new control-context fields in the choice-panel preview-state payload
- pass the same fields into `resolveRunEventRoomChoice`

### Task 5: Sync docs and verify

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README + help overlay**

- document the new `镇步 / 破势` recommendation reasons and routed echoes

**Step 2: Run the required command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

### Task 6: Audit and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Append the audit line**

- record task, branch, checks, merge status, push status, blocker, and fallback

**Step 2: Attempt git integration**

- commit on `feat/auto-control-target-recommendation`
- fast-forward merge into updated `main`
- push the feature branch and `main` if connectivity permits
