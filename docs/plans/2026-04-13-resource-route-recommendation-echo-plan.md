# Resource-Route Recommendation Echo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend resource-route recommendation persistence so prayer and supply routes can carry a tighter why-now echo into routed room-3 combat.

**Architecture:** Keep all decision and echo logic inside `shared/game-core.js`. Regressions in `scripts/regression-checks.mjs` define the new recommendation reasons and routed encounter strings first, then the implementation updates README and heartbeat bookkeeping to match.

**Tech Stack:** Plain JavaScript, Phaser 3 runtime wiring already present, Node-based regression script.

---

### Task 1: Queue the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-resource-route-recommendation-echo-design.md`
- Create: `docs/plans/2026-04-13-resource-route-recommendation-echo-plan.md`

**Step 1: Update the active TODO**

Promote the resource-route recommendation echo item to `Active`, demote the current `镇压路线 live target recommendation` item to `Next Up`, and describe the intended `回体回拍 / 特攻抢拍 / 备净稳场` contract.

**Step 2: Save the design and plan**

Document the targeted shared-helper approach, rejected wider note-persistence scope, and the exact recommendation/echo pairs to implement.

### Task 2: Lock the new resource-route contract with failing tests

**Files:**
- Test: `scripts/regression-checks.mjs`

**Step 1: Add failing recommendation assertions**

Cover:

- `renewalPrayer` resolves with `当前更缺回体` in a stamina-starved state
- `tempoPrayer` resolves with `当前更缺特攻` in a special-cooldown bottleneck state
- `fieldTonic` resolves with `当前可负担` when it is the only affordable supply route

**Step 2: Add failing routed encounter assertions**

Cover:

- `复苏祷言` entry / clear / source cue -> `回体回拍`
- `迅击祷言` entry / clear / source cue -> `特攻抢拍`
- `战地净化包` entry / clear / source cue -> `备净稳场`

Also assert that:

- `fieldTonic + 可净化N层` still prefers `净化后稳场`
- `carefulWager + 当前更宜稳押` still prefers `留本追赏`

**Step 3: Run the regression script to verify RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the new recommendation or encounter-echo expectations because the shared helper has not been updated yet.

### Task 3: Implement the shared helper changes

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add conservative prayer recommendation logic**

Reuse the existing action-state context to emit:

- `renewalPrayer` -> `当前更缺回体`
- `tempoPrayer` -> `当前更缺特攻`

Only emit one when the state clearly favors that branch.

**Step 2: Extend encounter recommendation feedback**

Map the new persisted reasons to:

- `回体回拍`
- `特攻抢拍`
- `备净稳场`

Keep stronger existing echoes ahead of these new ones.

**Step 3: Re-run the regression script to verify GREEN**

Run: `node scripts/regression-checks.mjs`

Expected: PASS.

### Task 4: Sync user-facing docs

**Files:**
- Modify: `README.md`

**Step 1: Update the route-feedback paragraph**

Add one concise sentence that resource-route recommendations now also carry `回体回拍 / 特攻抢拍 / 备净稳场` when those high-confidence reasons are what justified the choice.

**Step 2: Keep README readable**

Prefer editing the existing route paragraph instead of adding a new standalone section.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run the exact heartbeat verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Update TODO after verification**

Move the resource-route recommendation echo item to `Completed` with the completion timestamp and leave the next priority item in `Active`.

**Step 3: Commit and merge**

Run:

```bash
git add TODO.md README.md PROGRESS.log docs/plans/2026-04-13-resource-route-recommendation-echo-design.md docs/plans/2026-04-13-resource-route-recommendation-echo-plan.md scripts/regression-checks.mjs shared/game-core.js
git commit -m "feat: deepen resource route recommendation echoes"
git switch main
git merge --ff-only feat/auto-resource-route-echoes
git push origin feat/auto-resource-route-echoes
git push origin main
```

If network push is blocked, record the exact blocker and keep the merged local `main` plus feature branch intact.

**Step 4: Append the mandatory heartbeat audit line**

Record task, branch, checks, merge status, push status, and blocker/fallback details in `PROGRESS.log`.
