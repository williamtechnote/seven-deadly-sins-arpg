# Event Room Recommendation Source Cue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let high-confidence event-room recommendation reasons survive into one deterministic room-3 combat moment as a shared source cue.

**Architecture:** Extend the shared encounter-feedback contract with a cue builder that returns text only for approved route/recommendation/moment combinations. Keep `game.js` responsible only for detecting the routed room-3 moment and showing the shared cue once.

**Tech Stack:** Plain JavaScript, Phaser 3 runtime hooks, Node regression script

---

### Task 1: Shared helper contract

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression assertions for:

- exported `buildRunEventEncounterSourceCue`
- `breather + purifyingSip + 可净化2层 + stabilize => 净化后稳场`
- `pressure + desperationLesson + 已处绝境线 + engage => 压线抢势`
- `windfall + highStakeWager + 当前血线更能承受 + bounty => 血线够追赏`
- mismatched moment/profile => empty string

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new helper and assertions do not exist yet.

**Step 3: Write minimal implementation**

Add a shared recommendation-feedback helper and export `buildRunEventEncounterSourceCue`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper section before runtime/docs checks are added.

### Task 2: Runtime wiring

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regex coverage proving LevelScene:

- resets one-shot source-cue flags when a routed encounter profile is applied
- shows a shared source cue once on first pressure attack
- shows a shared source cue once on first breather stabilization kill
- shows a shared source cue once on routed bounty payoff

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because runtime does not yet call the new shared helper.

**Step 3: Write minimal implementation**

Wire the helper into the existing room-3 attack loop and drop hook with per-moment one-shot guards.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for shared helper and runtime contract.

### Task 3: Docs and final verification

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add README/help-overlay regex coverage for the new source-cue contract.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL until README/help copy is updated.

**Step 3: Write minimal implementation**

Document the cue behavior concisely in README/help text.

**Step 4: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
