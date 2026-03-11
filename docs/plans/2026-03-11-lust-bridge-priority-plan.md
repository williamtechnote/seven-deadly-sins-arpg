# Lust Bridge Priority Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the final Lust phase-3 pacing observation into three concrete TODO items, then implement the first two with bridge-first spacing between `reverseControl -> illusion` and `illusion -> mirageDance`.

**Architecture:** Keep the pass data-driven in `data.js`. Tighten `scripts/regression-checks.mjs` first with bridge-specific assertions that can fail independently, then update the phase-3 attack list and README/TODO wording to match the longer directed bridges.

**Tech Stack:** Plain JavaScript Phaser runtime data tables, Node-based regression checks, Markdown docs.

---

### Task 1: Seed the bridge-first backlog

**Files:**
- Create: `docs/plans/2026-03-11-lust-bridge-priority-design.md`
- Create: `docs/plans/2026-03-11-lust-bridge-priority-plan.md`
- Modify: `TODO.md`

**Step 1: Record the chosen design**

Write the bridge-first design doc with the three options and the selected option 1 recommendation.

**Step 2: Rewrite the active queue**

Replace the single active observation in `TODO.md` with `二十二-一 / 二十二-二 / 二十二-三`, ordered so the first two items are the implementation targets for this heartbeat.

### Task 2: Lock the longer `reverseControl -> illusion` bridge

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Add a dedicated assertion for the exact light-pressure segment between `reverseControl` and `illusion`, requiring one more trailing `charmBolt` / `dash` pair than the current phase-3 data provides.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `reverseControl -> illusion` bridge assertion.

**Step 3: Write minimal implementation**

Extend only the `reverseControl -> illusion` segment in `BOSSES.lust.phases[2].attacks`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated `reverseControl -> illusion` assertion while the rest of the suite stays green.

### Task 3: Lock the longer `illusion -> mirageDance` bridge and sync docs

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add a dedicated assertion for the exact light-pressure segment between `illusion` and `mirageDance`, and tighten the README wording so the bridge-first pass must be documented.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the `illusion -> mirageDance` bridge assertion and README wording.

**Step 3: Write minimal implementation**

Extend only the `illusion -> mirageDance` segment in `data.js`, then update README and mark `二十二-一 / 二十二-二` complete in `TODO.md`.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Audit and ship the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Commit the heartbeat**

Commit the bridge-first changes after the required checks pass.

**Step 2: Push with fallback**

Try the requested feature-branch push plus main push, and if local branch / checkout locks block the normal path, use the existing remote-ref fallback pattern.

**Step 3: Append audit**

Record tasks, branch handling, test command, merge/push outcome, and the git lock blocker in `PROGRESS.log`.
