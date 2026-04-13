# Action-Route Encounter Anchors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the remaining action-shaping blessing shrines into deterministic room-3 encounter routing and give them baseline route anchors when no stronger recommendation-specific cue exists.

**Architecture:** Keep all routing and cue decisions in `shared/game-core.js`. First lock the new profile mappings and anchor helpers with regression assertions, then implement a shared route-feedback fallback that preserves the existing recommendation-specific cues for older routed shrines. Update README/help copy last so docs match the shared helper output.

**Tech Stack:** Plain JavaScript, shared gameplay helpers in `shared/game-core.js`, Phaser help overlay copy in `game.js`, CLI regression checks in `scripts/regression-checks.mjs`.

---

### Task 1: Record the heartbeat scope and reprioritize TODO

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-action-route-encounter-anchors-design.md`
- Create: `docs/plans/2026-04-13-action-route-encounter-anchors-plan.md`

**Step 1: Update the TODO lane**

- mark the earlier build-route encounter mapping slice complete
- promote the new action-route encounter anchor item to Active
- queue the recommendation-specific follow-up behind it

**Step 2: Save the design and plan docs**

- capture the route-to-profile table
- document the fallback order: recommendation-specific cue first, baseline route anchor second

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add the new assertions**

Add coverage that:

- `连斩 / 游步 / 镇步 / 破势 / 回息 / 借势 / 催锋 / 回身 / 追猎 / 调息` now preview the expected `下间缓冲 / 高压 / 淘金`
- entry helpers append `连斩抢拍 / 游步整拍 / 镇步控场 / 破势追杀 / 回息稳场 / 借势重击 / 催锋连段 / 回身整拍 / 追猎追赏 / 调息回线` when no recommendation receipt exists
- clear helpers and source-cue helpers expose the same baseline anchors at the correct routed combat beat
- an existing recommendation-specific case still beats the baseline fallback

**Step 2: Run the regression script to verify RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new action-route encounter mapping assertions because the shared helper only knows about the earlier routed shrines.

### Task 3: Implement the shared routing and anchor fallback

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Extend explicit encounter routing**

- map the ten remaining action-shaping route keys onto `breather / pressure / windfall`

**Step 2: Add shared baseline route feedback**

- create a choice-key lookup for baseline `echo / sourceCue / sourceCueMoment`
- keep the current recommendation-specific feedback as the first-priority path
- use the baseline route feedback only when no recommendation-specific cue applies

**Step 3: Run the regression script to verify GREEN**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new routing and cue assertions.

### Task 4: Sync README and help overlay copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update docs**

- keep README concise but explicit about the new action-route encounter anchors
- extend the help overlay text so the room-3 routing language matches the shared helper output

**Step 2: Re-run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with the README/help regex coverage still green.

### Task 5: Verify, audit, and ship with the git fallback

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

**Step 2: Attempt the requested git flow**

- update `main` in the writable feature-branch clone
- commit on `feat/auto-action-route-encounter-anchors`
- fast-forward merge into `main`
- push `main` if the environment permits
- if local branch creation or push is blocked, record the blocker and fallback in `PROGRESS.log`
