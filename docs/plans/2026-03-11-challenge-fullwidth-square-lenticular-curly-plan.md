# Full-Width Square Lenticular And Curly-Quote Mixed Wrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the next two full-width-square mixed run-challenge wrapper families into the documented regression contract.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`; add failing regression assertions first, then update README/help/TODO coverage so the wrapper contract is explicit and auditable without changing fallback semantics.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［〖挑战〗］` / `〖［本局挑战］〗`
- `［“挑战”］` / `“［本局挑战］”`
- README/help-overlay mentions for both pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on README/help-overlay documentation assertions while the shared parser behavior stays green.

**Step 3: Write minimal implementation**

Update the README/help overlay copy and backlog records. Only touch `shared/game-core.js` if the runtime assertions fail.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Refresh the backlog and planning notes

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-lenticular-curly-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-lenticular-curly-plan.md`

**Step 1: Promote the implemented TODO items**

Move the lenticular and curly double-quote full-width-square items to Completed with timestamps.

**Step 2: Queue the next follow-ups**

Leave:
- `［‘挑战’］` / `‘［本局挑战］’`
- `［'挑战'］` / `'［本局挑战］'`

### Task 3: Verify and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:
- `node --check game.js`
- `node --check data.js`
- `node --check shared/game-core.js`
- `node scripts/regression-checks.mjs`

**Step 2: Update the audit trail**

Append the mandatory heartbeat line with tasks, branch handling, tests, merge status, push status, and blocker details.
