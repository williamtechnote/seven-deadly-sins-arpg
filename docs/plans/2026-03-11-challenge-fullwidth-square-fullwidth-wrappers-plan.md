# Full-Width Square Full-Width Wrapper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add auditable regression and documentation coverage for the next two `［...］` full-width wrapper permutations and queue the next follow-up.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`, add failing regression assertions for the missing `［｛挑战｝］` and `［（挑战）］` cases, then update README/help overlay text and TODO ordering so the contract is explicit. No parser changes are needed unless the red phase exposes a real gap.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Queue the next three `［...］` follow-ups

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-fullwidth-wrappers-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-fullwidth-wrappers-plan.md`

**Step 1: Prioritize the queue**

Keep `［｛挑战｝］` first, `［（挑战）］` second, and `［〈挑战〉］` third.

**Step 2: Record the scope**

Save the design and implementation notes so later heartbeat cycles can continue the same family without re-deriving the order.

### Task 2: Lock the missing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［｛挑战｝］` / `｛［本局挑战］｝`
- `［（挑战）］` / `（［本局挑战］）`
- README/help overlay entries for both pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new README/help assertions while parser behavior already passes.

**Step 3: Write minimal implementation**

Update the README/help overlay contract strings and TODO completion status without changing parser logic unless the test output proves it is necessary.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

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
