# Encounter Composition Routing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make resolved event-room encounter profiles rebuild room 3 around profile-specific enemy compositions instead of only retuning stats.

**Architecture:** Add a shared helper that derives a deterministic roster from an area enemy pool and encounter profile, then have `LevelScene` consume that helper when applying the chosen profile to room 3. Drive the work with regression assertions first, then sync docs and backlog state.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the new backlog/design state

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-09-encounter-composition-routing-design.md`
- Create: `docs/plans/2026-04-09-encounter-composition-routing-plan.md`

**Step 1: Update the active TODO**

Record `遭遇构成分流` as the only active item and move the prior umbrella item to `Completed`.

**Step 2: Save the design + plan docs**

Capture the rejected alternatives, chosen direction, and TDD-first execution plan.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new helper that:

- returns two lowest-pressure archetypes for `breather`
- returns all three area archetypes for `pressure`
- returns two highest-gold archetypes for `windfall`

**Step 2: Add runtime-hook assertions**

Extend the existing encounter-routing source checks so they fail until `LevelScene` routes room-3 enemy rebuilding through the new helper.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper and runtime hook do not exist yet.

### Task 3: Implement the shared helper and room-3 rebuilding

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared roster helper**

Export a deterministic helper that scores an area pool by pressure and gold and returns the desired encounter roster for each profile.

**Step 2: Rebuild room 3 from the selected roster**

Teach `LevelScene` to destroy the placeholder room-3 enemies, respawn the resolved roster, and then apply the existing encounter stat multipliers to the new enemies.

**Step 3: Keep implementation minimal**

Do not add new UI modules or new encounter-profile states beyond the roster contract needed for this feature.

### Task 4: Sync docs and verify

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Document that encounter routing now changes room-3 composition in addition to HP/speed/gold tuning.

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

**Step 2: Commit and integrate**

Create a feature commit, merge it to `main`, push `main`, and keep the feature branch.
