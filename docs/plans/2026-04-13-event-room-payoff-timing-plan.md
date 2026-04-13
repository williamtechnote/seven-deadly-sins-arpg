# Event Room Payoff Timing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface a compact `兑现时机` label for event-room routes across the choice panel, resolved HUD summary, and shrine/world label.

**Architecture:** Add shared timing-label helpers in `shared/game-core.js`, thread them into existing event-room text builders in shared/game-core and `game.js`, then lock the new contract in regression checks and docs.

**Tech Stack:** Phaser 3, plain JavaScript, node-based regression checks

---

### Task 1: Add failing regression coverage for payoff timing

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- shared timing helper outputs
- resolved HUD summary lines including timing
- resolved HUD merged lines including timing
- world labels including timing

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new payoff-timing assertions

**Step 3: Write minimal implementation**

Add timing helpers and thread them into existing shared text builders.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new payoff-timing coverage

### Task 2: Thread timing into runtime choice-panel copy

**Files:**
- Modify: `game.js`
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add/update a static regression expectation proving the choice-panel option builder appends the shared timing label next to the routed encounter preview.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new choice-panel timing hook

**Step 3: Write minimal implementation**

Update `_openRunEventChoicePanel()` to append the shared timing label without changing existing footer/recommendation behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the choice-panel timing hook

### Task 3: Sync docs and TODO

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `game.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add README/help-overlay assertions for the new payoff-timing contract.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new documentation expectations

**Step 3: Write minimal implementation**

Update README/help overlay/TODO text to describe the timing ladder concisely.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS
