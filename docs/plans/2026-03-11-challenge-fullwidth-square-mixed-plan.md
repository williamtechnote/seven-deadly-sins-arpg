# Full-Width Square Mixed Wrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add auditable regression and documentation coverage for the next full-width-square mixed run challenge wrappers.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`, then expand the regression suite and user-facing docs so these wrapper permutations are explicitly locked in. No new parsing path is needed unless the tests expose a gap.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Lock failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［[挑战]］` / `[［本局挑战］]`
- `［〔挑战〕］` / `〔［本局挑战］〕`
- README/help-overlay documentation entries for both pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on README/help-overlay documentation assertions while the normalizer behavior already passes.

**Step 3: Write minimal implementation**

Update the README/help-overlay contract strings and TODO ordering without changing the shared parser unless the new assertions expose a real parsing gap.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Update planning backlog

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-mixed-plan.md`

**Step 1: Prioritize follow-ups**

Keep the current ASCII-square item first, then queue shell, lenticular, and curly double-quote full-width-square follow-ups.

**Step 2: Record the selection**

Save the design/plan notes so the next heartbeat cycle can continue the same wrapper family without re-deriving the order.

### Task 3: Verify and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:
- `node --check game.js`
- `node --check data.js`
- `node --check shared/game-core.js`
- `node scripts/regression-checks.mjs`

**Step 2: Update audit trail**

Append the mandatory heartbeat line with tasks, branch handling, tests, merge status, push status, and blocker details.
