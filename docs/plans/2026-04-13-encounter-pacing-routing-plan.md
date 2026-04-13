# Encounter Pacing Routing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make resolved event-room encounter profiles change room 3's opening engagement timing, not just lineup, formation, and stat tuning.

**Architecture:** Extend the shared room-3 formation contract with deterministic engage delays, then have `LevelScene` stamp those timings onto spawned room-3 enemies while `Enemy.update()` holds delayed enemies in a passive pre-engage state. Drive the work with regression assertions first, then sync README and the heartbeat audit.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock backlog and design state

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-encounter-pacing-routing-design.md`
- Create: `docs/plans/2026-04-13-encounter-pacing-routing-plan.md`

**Step 1: Update the active TODO**

Record `遭遇起手节奏分流` as the active systemic follow-up to the existing encounter routing work.

**Step 2: Save the design + plan docs**

Capture the rejected alternatives, chosen direction, and TDD-first execution plan.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for the encounter formation helper so it also proves:

- `breather` slots stagger into delayed engagement beats
- `pressure` slots engage immediately
- `windfall` keeps a delayed deeper bounty target

**Step 2: Add runtime-hook assertions**

Extend the source checks so they fail until:

- room-3 spawns copy `engageDelayMs` onto spawned enemies
- `Enemy.update()` respects a profile-driven delayed-engagement timestamp

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the new timing contract and runtime hook do not exist yet.

### Task 3: Implement the timing contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Extend the shared encounter-slot helper**

Return deterministic `engageDelayMs` values alongside lane/depth data for each encounter profile.

**Step 2: Stamp engage timing onto room-3 enemies**

When rebuilding room 3, assign the per-slot delay to each enemy using the current scene clock.

**Step 3: Hold delayed enemies in a passive pre-engage state**

Teach `Enemy.update()` to stay idle and non-aggressive until the delayed engage timestamp elapses.

### Task 4: Sync docs and verify

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Document that encounter routing now changes room-opening timing in addition to lineup, formation, and reward pressure.

**Step 2: Run the required commands**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

### Task 5: Close out the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Append the audit line**

Record task, branch, checks, merge status, push status, blocker, and fallback.

**Step 2: Attempt git integration**

Update `main`, create the requested feature branch, and if git writes are still blocked, record the exact fallback used without committing on `main`.
