# Battle Feedback Status And Consumables Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve battle readability by preventing wasteful consumable usage and splitting HUD status display into prioritized debuff/buff lanes.

**Architecture:** Add shared pure helpers in `shared/game-core.js` for consumable resolution and status HUD formatting, then wire `game.js` to consume those results for floating text and UI updates. Validate through the existing Node regression script instead of adding a new test framework.

**Tech Stack:** Phaser 3, vanilla JavaScript, Node-based regression checks

---

### Task 1: Prioritize the next feedback slice

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-feedback-status-consumables-design.md`
- Create: `docs/plans/2026-03-07-feedback-status-consumables.md`

**Step 1: Capture the selected TODO items**

- Replace the vague active feedback item with three concrete extensions.

**Step 2: Save the short design**

- Document the chosen helper-driven approach and the non-goals for this iteration.

**Step 3: Save the implementation plan**

- Keep the next tasks small enough to execute with TDD.

### Task 2: Add failing regression tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Add consumable-resolution assertions for no-waste healing/stamina behavior.
- Add status-HUD formatting assertions for grouping and ordering.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new shared helpers do not exist yet.

### Task 3: Implement shared helpers

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Add consumable resolution helper and status HUD summary helper.
- Export both helpers.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage and the existing regression suite.

### Task 4: Wire runtime behavior

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Consume the shared helpers**

- Make quick-slot usage show actual feedback and avoid wasteful healing/stamina consumption.
- Split HUD status display into debuff/buff lines.

**Step 2: Update docs**

- Document the new quick-slot and HUD behavior in `README.md`.

### Task 5: Verify and record

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run project verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt git workflow**

- Try branch/commit/merge/push commands required by the user workflow.
- If sandbox blocks git metadata writes or network access, log the exact blocker in `PROGRESS.log`.
