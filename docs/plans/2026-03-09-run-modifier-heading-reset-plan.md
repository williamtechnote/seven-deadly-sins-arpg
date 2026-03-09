# Run Modifier Heading Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add behavior-level coverage and a shared helper for the run-modifier heading reset path so silent challenge badges clear style and release title width consistently.

**Architecture:** Extract the heading presentation math into `shared/game-core.js`, then make `UIScene._updateRunModifierHeading` apply the helper output. Cover the helper in CLI regressions and keep source checks for the Phaser reset path.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression checks.

---

### Task 1: Promote the heartbeat work items

**Files:**
- Modify: `TODO.md`

**Step 1: Update the active list**

Add the missing README/doc sync item next to the existing source/layout guard item so the heartbeat has two active tasks in the same codepath.

**Step 2: Verify the TODO ordering**

Confirm the new item stays directly under the existing active item.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper-level assertions**

Write assertions for the new shared heading helper covering the empty-badge reset state and the reserved-width state.

**Step 2: Add source assertions**

Write source checks that `game.js` consumes the shared helper and keeps clearing badge style/visibility on the silent path.

**Step 3: Run the regression script**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL before production code is updated.

### Task 3: Implement the shared helper and scene wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add the shared helper**

Implement a pure helper that resolves heading presentation for visible and silent badge states.

**Step 2: Route the scene through the helper**

Update `_updateRunModifierHeading` to consume the helper output while preserving the explicit badge-node reset on the silent path.

**Step 3: Update README copy**

Document that the title reclaims the full width budget when the hidden badge goes silent.

### Task 4: Verify and record heartbeat output

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification commands**

Run:
`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Mark completed TODO items**

Move the finished active items into the completed list with timestamps.

**Step 3: Attempt git commit/merge/push with heartbeat fallbacks**

Try the requested branch/merge flow, then record any lock/non-fast-forward blockers explicitly in `PROGRESS.log`.
