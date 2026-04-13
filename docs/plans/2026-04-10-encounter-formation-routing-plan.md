# Encounter Formation Routing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make resolved event-room encounter profiles change room 3's opening formation, not just its enemy roster and stat tuning.

**Architecture:** Add a shared helper that converts a resolved encounter profile plus roster into deterministic spawn slots, then have `LevelScene` rebuild room 3 from those slots before applying the existing HP/speed/gold profile tuning. Drive the change with regression assertions first, then sync README and the audit trail.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the backlog and design trail

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-10-encounter-formation-routing-design.md`
- Create: `docs/plans/2026-04-10-encounter-formation-routing-plan.md`

**Step 1: Update the active TODO**

Record `遭遇阵型分流` as the current active item so the heartbeat backlog points at a new systemic direction.

**Step 2: Save the design + plan docs**

Capture the rejected alternatives, chosen direction, and TDD-first implementation outline.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new formation helper that:

- pushes `breather` spawns deeper and wider
- compresses `pressure` spawns nearer the entrance
- staggers `windfall` spawns into distinct front/back depth bands

**Step 2: Add runtime-hook assertions**

Extend the existing encounter-routing source checks so they fail until `LevelScene` rebuilds room 3 from profile-driven formation slots instead of a single shared lane formula.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper and runtime hook do not exist yet.

### Task 3: Implement the shared helper and room-3 rebuilding

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared formation helper**

Export a deterministic helper that returns `{ enemyKey, laneRatio, depthBand }` style slot descriptors for each encounter profile.

**Step 2: Rebuild room 3 from formation slots**

Teach `LevelScene` to spawn roster enemies using those profile-driven slot descriptors instead of the current universal spacing formula.

**Step 3: Keep implementation minimal**

Do not add a new subsystem or AI state; only change the room-3 opening geometry contract needed for this feature.

### Task 4: Sync docs and verify

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Document that encounter routing now changes room-3 opening formation in addition to lineup and stat tuning.

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

Record task, branch, test command result, merge status, push status, blocker, and fallback.

**Step 2: Attempt git integration**

If local branch/merge/push are still blocked by sandboxed git locks, record the exact failure and the fallback used.
