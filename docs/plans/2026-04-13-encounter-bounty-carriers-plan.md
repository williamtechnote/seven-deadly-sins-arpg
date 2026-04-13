# Encounter Bounty Carriers Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make route payoff readable inside room 3 by routing extra gold weight and a visible bounty marker onto the appropriate encounter slots.

**Architecture:** Extend the shared room-3 formation slot contract with reward metadata, then have `LevelScene` consume the slot metadata when rebuilding room 3 so per-enemy drops and any bounty marker stay deterministic and profile-driven.

**Tech Stack:** Phaser 3, plain JavaScript, `shared/game-core.js`, repo regression script

---

### Task 1: Lock the shared reward-slot contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add/extend regression coverage so `buildRunEventEncounterFormationSlots()` must include reward metadata for each profile, especially a heavier `goldDropMultiplier` and `bountyLabel` on the delayed deep `淘金战` target.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new encounter reward-slot assertions.

**Step 3: Write minimal implementation**

Update the shared formation helper to return reward metadata together with lane/depth/timing data.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: encounter reward-slot assertions pass.

### Task 2: Consume the reward metadata in runtime

**Files:**
- Modify: `game.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a source-hook regression proving room-3 rebuild now consumes slot reward metadata to scale gold drops and attach a bounty tag only where the shared contract asks for one.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new runtime hook assertion.

**Step 3: Write minimal implementation**

Update `Enemy`/`LevelScene` so room-3 enemies inherit slot reward metadata, scale their routed gold drops from it, and display a lightweight bounty marker for marked targets.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: runtime hook assertion passes.

### Task 3: Document the new route payoff and verify end-to-end

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Add a concise README note that `淘金战` now pins more of its payout onto the delayed deep target instead of keeping reward purely room-wide.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS.

**Step 3: Record delivery**

Append the mandatory audit line to `PROGRESS.log`, then attempt commit / merge / push per the heartbeat workflow or record the explicit git blocker and fallback.
