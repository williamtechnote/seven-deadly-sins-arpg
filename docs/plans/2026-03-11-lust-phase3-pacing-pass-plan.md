# Lust Phase 3 Pacing Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Further slow `魅惑女妖` phase 3 loopback pressure by extending `reverseControl` recovery and adding longer directed bridges before `illusion` and `mirageDance`.

**Architecture:** Keep the pass data-driven. Update the phase-3 attack order in `data.js`, bump the `reverseControl` recovery constant in `game.js`, and lock both behaviors in `scripts/regression-checks.mjs` before syncing `README.md` and `TODO.md`.

**Tech Stack:** Plain JavaScript Phaser runtime, static data tables, Node-based regression checks, Markdown docs.

---

### Task 1: Lock the new phase-3 bridge ordering

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Update the Lust phase-3 attack-order assertion to require the extra `charmBolt` / `dash` bridge segments before `illusion` and `mirageDance`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old attack order.

**Step 3: Write minimal implementation**

Extend the phase-3 `attacks` array in `data.js` without changing the rest of the selector metadata.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated attack-order assertion.

### Task 2: Lock the longer `reverseControl` recovery window

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Update the `reverseControl` recovery assertion to require the longer timing constant.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old recovery value.

**Step 3: Write minimal implementation**

Increase the `reverseControl` recovery constant and keep the rest of the attack branch unchanged.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated recovery assertion.

### Task 3: Sync docs and backlog

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README**

Document the longer `reverseControl` recovery beat and the additional directed bridges before `illusion` and `mirageDance`.

**Step 2: Update backlog state**

Mark `十六-一` and `十六-二` complete once verification passes, and leave `十六-三` active.

**Step 3: Append audit**

Record the heartbeat run, required test command, and blocked git branch/commit/merge/push steps if sandbox restrictions remain.
