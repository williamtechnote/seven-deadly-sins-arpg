# Full-Width Square Quote-Family Mixed Wrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the next two nested full-width-square quote-family wrapper pairs into the documented run-challenge sanitization contract.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`; use TDD to add regression assertions first, then update README/help/TODO coverage and only change parser code if the new runtime assertions expose a real gap.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Queue the next active TODO items

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-quote-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-quote-mixed-plan.md`

**Step 1: Update the backlog**

Keep the existing active `［〝挑战〞］` / `〝［本局挑战］〞` item first, then add:
- `［〝挑战〟］` / `〝［本局挑战］〟`
- `［『挑战』］` / `『［本局挑战］』`
- `［｢挑战｣］` / `｢［本局挑战］｣`

**Step 2: Preserve priority**

Make the first two active items the ones implemented in this cycle.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［〝挑战〞］击败 30 个敌人`
- `〝［本局挑战］〞挑战：本局`
- `［〝挑战〟］击败 30 个敌人`
- `〝［本局挑战］〟挑战：本局`
- README/help overlay mentions for both wrapper pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new README/help assertions before the docs are updated.

### Task 3: Implement the minimum green path

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing contract text**

Extend README/help overlay copy so both new nested full-width-square quote-family wrappers are documented alongside the existing family.

**Step 2: Mark completed work**

Move the first two active TODO items to `Completed` with this cycle's timestamp and leave the remaining brainstormed items active.

**Step 3: Verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Run required heartbeat verification and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Record delivery**

Append the mandatory audit line with tasks, requested/actual branch, test command, merge status, push status, and blocker/fallback details.
