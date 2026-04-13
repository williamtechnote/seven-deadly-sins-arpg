# Build-Route Encounter Mapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Route `武备圣坛 / 烙痕圣坛` choices into deterministic room-3 encounter profiles and let matching recommendation reasons cash into shared entry/clear/source cues.

**Architecture:** Extend `shared/game-core.js` with explicit choice-key encounter mappings plus recommendation feedback for the four build-facing routes. Lock the new behavior in `scripts/regression-checks.mjs`, then update README/help copy so docs match the shared contract. Runtime room-3 cue hooks stay unchanged and consume the richer shared helper output.

**Tech Stack:** Plain JavaScript, shared logic in `shared/game-core.js`, Phaser scene glue in `game.js`, CLI regression checks in `scripts/regression-checks.mjs`.

---

### Task 1: Add the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that:

- `压阵修习` previews `下间高压`
- `离弦修习` previews `下间淘金`
- `余烬修习` previews `下间缓冲`
- `血痕修习` previews `下间高压`
- matching recommendation reasons append `贴身压阵 / 远程追赏 / 灼烧稳场 / 挂血抢势` to entry/clear/source-cue helpers

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new build-route encounter routing assertions because the shared mapping is not implemented yet.

### Task 2: Implement the shared encounter mapping

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- extend encounter-profile selection so the four route keys map to the chosen room-3 profile
- extend recommendation feedback so the matching route/reason pairs emit the new echo/source-cue text

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new build-route routing assertions.

### Task 3: Sync docs and help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update the docs**

- keep README concise
- update the help overlay copy in `game.js`
- describe the new routed examples for `压阵 / 离弦 / 余烬 / 血痕`

**Step 2: Re-run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with updated README/help regex coverage.

### Task 4: Verify and close the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

**Step 2: Commit and merge using the feature-branch clone**

- commit on `feat/auto-build-route-encounter-mapping`
- fast-forward merge into `main`
- push feature branch and `main` if the environment permits
- if push is blocked, record the blocker and fallback in `PROGRESS.log`
