# Mirage Dance Tuning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tune `魅影连舞` cadence and finisher fairness while preserving the existing phase-3 mechanic shape.

**Architecture:** Keep the work inside the current `mirageDance` special-attack branch and the lightweight source-hook regression suite. Avoid boss-system refactors; only add the minimum state needed for cadence and locked finisher targeting.

**Tech Stack:** Plain JavaScript, Phaser 3, Node-based regression checks

---

### Task 1: Cadence spacing guard and tuning

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add source-hook assertions for:
- `this.attackData.beatDelays = [240, 340, 460]`
- `this.attackData.finisherDelayMs = 220`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL with missing cadence constants for `mirageDance`

**Step 3: Write minimal implementation**

Update `mirageDance` to:
- initialize the beat-delay ladder
- schedule each beat from that ladder
- wait for the finisher settle delay before spawning/activating the reverse-wave finisher

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new cadence hooks

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs game.js README.md
git commit -m "feat: tune mirage dance cadence"
```

### Task 2: Finisher target-lock guard and tuning

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add source-hook assertions for:
- `this.attackData.finisherLockX = player.x`
- `this.attackData.finisherLockY = player.y`
- projectile collapse using `this.attackData.finisherLockX / Y`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL with missing target-lock hooks for `mirageDance`

**Step 3: Write minimal implementation**

Snapshot the player position at finisher start and collapse projectiles toward that locked point instead of live player coordinates.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new finisher fairness hooks

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs game.js README.md
git commit -m "feat: lock mirage dance finisher target"
```

### Task 3: Audit and delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:
- `node --check game.js`
- `node --check data.js`
- `node --check shared/game-core.js`
- `node scripts/regression-checks.mjs`

Expected: all commands pass

**Step 2: Integrate**

Attempt:
- create/use `feat/auto-mirage-dance-tuning`
- commit work
- merge to `main`
- push `main`

Record any sandbox git-ref blocker and the fallback used.

**Step 3: Append audit line**

Append a single `PROGRESS.log` line with timestamp, tasks, branch, tests, merge status, push status, and blocker if any.
