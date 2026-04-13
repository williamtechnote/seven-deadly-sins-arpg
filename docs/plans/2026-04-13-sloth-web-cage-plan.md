# Sloth Web Cage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a real phase-2/3 Sloth hazard that turns “稳住中心” into a readable arena-control test.

**Architecture:** Extend boss phase data and telegraph metadata with `webCage`, then implement one dedicated `_execHazard()` branch that snapshots player position and draws a shrinking square web perimeter. Sync README / help text / TODO / audit state around that same contract.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime, shared boss metadata tables, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-sloth-web-cage-design.md`
- Create: `docs/plans/2026-04-13-sloth-web-cage-plan.md`

**Step 1: Reprioritize the boss-diversity backlog**

Promote `梦境蛛后 phase 2/3 蛛网囚笼` to `Active`, then move the previous Sloth follow-up into `Next Up`.

**Step 2: Save the design / plan docs**

Document why an authored arena-control hazard is higher leverage than another `sleepFog` tuning pass or another summon-only follow-up.

### Task 2: Write the failing regression guard

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Extend the boss-mechanic diversity contract**

Require:

- `BOSSES.sloth` phase 2 and 3 to include `webCage`
- `ATTACK_DISPLAY_NAMES.webCage === '蛛网囚笼'`
- a dedicated counter hint and counter window
- `BOSS_ATTACK_STATUS_ON_HIT.webCage` to apply `slow`
- `BOSS_ATTACK_TYPES.HAZARD` to include `webCage`

**Step 2: Require source hooks**

Assert that `_execHazard()` exposes a `webCage` branch that snapshots player position, draws a shrinking cage, and damages the player on wall contact.

**Step 3: Run RED**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL until the new Sloth metadata and runtime branch exist.

### Task 3: Implement the Sloth mechanic

**Files:**
- Modify: `data.js`
- Modify: `game.js`

**Step 1: Add the new attack contract**

Wire `webCage` into Sloth phase 2/3 plus the localized name, hint, counter-window, status-on-hit, and hazard classification tables.

**Step 2: Add the hazard runtime**

Implement one `_execHazard()` branch that:

- roots the boss during the attack
- snapshots the player’s initial position
- draws a shrinking square cage around that anchor
- applies chip damage and `slow` on wall contact
- cleans up graphics before returning to the normal cooldown flow

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that `梦境蛛后` phase 2/3 now adds `蛛网囚笼`, a center-holding hazard that punishes getting swept into the web wall.

**Step 2: Update the help overlay**

Mirror the same contract in the in-game help text so the mechanic is documented outside the README too.

### Task 5: Verify, ship, and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun, up to the heartbeat limit.

**Step 2: Commit and merge**

Commit on `feat/auto-sloth-web-cage`, fast-forward merge into `main`, keep the feature branch, and attempt to push `main`.

**Step 3: Append the mandatory audit line**

Record the chosen task, branch, checks, merge status, push status, and any blocker/fallback details in `PROGRESS.log`.
