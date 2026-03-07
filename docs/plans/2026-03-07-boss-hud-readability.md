# Boss HUD Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve boss-fight readability by adding boss HP afterimage feedback, phase alert flashing, and phase-threshold HUD markers.

**Architecture:** Add pure boss-HUD helpers in `shared/game-core.js` for lagging HP bar behavior and phase-summary formatting, then wire `game.js` to render those values in the BossScene HUD. Validate through `scripts/regression-checks.mjs` so the new UI behavior has deterministic coverage.

**Tech Stack:** Phaser 3, vanilla JavaScript, Node regression checks

---

### Task 1: Re-prioritize the real active queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-boss-hud-readability-design.md`
- Create: `docs/plans/2026-03-07-boss-hud-readability.md`

**Step 1: Replace stale active TODO items**

- Move the already-shipped consumable/HUD tasks to completed backlog entries.
- Promote the boss HUD slice to the top of the active queue.

**Step 2: Save the short design**

- Document the helper-first approach and the two boss-HUD items selected for this heartbeat.

**Step 3: Save the implementation plan**

- Keep the remaining tasks small enough to execute with TDD.

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Add assertions for boss HP trail behavior.
- Add assertions for phase labels, next-threshold text, and threshold marker ratios.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the boss-HUD helpers do not exist yet.

### Task 3: Implement shared boss-HUD helpers

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Add a helper to advance the lagging boss HP afterimage ratio.
- Add a helper to summarize boss phase HUD data from phase thresholds and current phase index.
- Export both helpers.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage and the existing suite.

### Task 4: Wire BossScene rendering

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Render the new HUD state**

- Draw a lagging afterimage bar behind the main boss HP fill.
- Flash the boss HP frame/phase label during the phase alert window.
- Show phase label, next-threshold label, and threshold markers on the boss bar.

**Step 2: Update docs**

- Document the new boss-HUD readability features in `README.md`.

### Task 5: Verify and record

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run project verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt git workflow**

- Try the required branch/commit/merge/push flow.
- If git metadata writes are blocked, record the exact failure in `PROGRESS.log`.
