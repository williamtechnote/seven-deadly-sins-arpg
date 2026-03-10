# Full-Width Square Corner-Quote Mixed Wrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the two active full-width-square corner-quote wrapper families into the documented run-challenge sanitization contract.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`; add failing regression assertions first, then sync README/help/TODO/design notes so the contract is explicit and auditable without changing parser behavior unless a runtime assertion forces it.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Add the failing contract coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［『挑战』］` / `『［本局挑战］』`
- `［｢挑战｣］` / `｢［本局挑战］｣`
- README/help-overlay mentions for both pairs

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: README/help coverage fails while the shared parser assertions stay green.

### Task 2: Sync the user-facing contract

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the two new wrapper pairs to the README and help-overlay decorator-cleanup contract strings. Keep `shared/game-core.js` unchanged unless a runtime assertion fails.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Refresh the backlog and planning notes

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-corner-quotes-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-corner-quotes-plan.md`

**Step 1: Mark the completed TODO items**

Move the two implemented full-width-square corner-quote items to Completed with the heartbeat timestamp.

**Step 2: Queue the next follow-ups**

Add the next three full-width-square wrapper candidates:
- `［＜挑战＞］` / `＜［本局挑战］＞`
- `［《挑战》］` / `《［本局挑战］》`
- `［「挑战」］` / `「［本局挑战］」`

### Task 4: Verify and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Record the heartbeat audit**

Append the mandatory audit line with the requested branch name, the local-branch creation blocker, the fallback delivery path, test status, merge status, and push status.
