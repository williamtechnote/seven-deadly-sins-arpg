# Lust Phase Pacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split `魅惑女妖` phase 3 pacing so major specials breathe between one another without refactoring the boss system.

**Architecture:** Keep the work in Lust's phase data and the existing boss attack selector. Use lightweight source/data-hook regression checks instead of adding a new gameplay test harness.

**Tech Stack:** Plain JavaScript, Phaser 3, Node-based regression checks

---

### Task 1: Interleave Lust phase 3 attacks

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add a data assertion for Lust phase 3's exact attack order:
- `['charmBolt', 'reverseControl', 'dash', 'illusion', 'charmBolt', 'mirageDance', 'dash']`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current phase 3 array still stacks the three specials too tightly

**Step 3: Write minimal implementation**

Update Lust phase 3's `attacks` list to the interleaved ladder and sync README wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new phase-order guard

### Task 2: Add a major-special breather guard

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Add source-hook assertions for:
- `this.lastCompletedAttack = null`
- a `_pickPhaseAttack(attacks)` helper
- a major-special breather branch that scans forward for a non-major attack

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the selector still uses a raw modulo pick

**Step 3: Write minimal implementation**

Track the last completed attack and route phase picks through a helper that prevents consecutive major specials when a breather attack exists.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the selector guard hooks

### Task 3: Delivery audit

**Files:**
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
- create/use `feat/auto-lust-phase-pacing`
- commit work
- merge to `main`
- push `main`

Record the git ref-lock blocker if local branch creation still fails and use the remote feature-branch push fallback.

**Step 3: Append audit line**

Append a single `PROGRESS.log` line with timestamp, tasks, branch, tests, merge status, push status, and blocker if any.
