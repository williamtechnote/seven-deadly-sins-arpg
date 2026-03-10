# Challenge Full-Width Square Square And White-Square Mixed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the next two active full-width-square mixed challenge wrapper pairs into regression checks, README/help text, and heartbeat bookkeeping.

**Architecture:** Leave `shared/game-core.js` unchanged because the recursive decorator table already handles these pairs. Formalize the support through regression assertions, user-facing copy, TODO updates, and the audit log.

**Tech Stack:** Plain JavaScript, Phaser 3 help overlay copy, Node regression checks

---

### Task 1: Add the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `［【挑战】］` / `【［本局挑战］】`
- `［〚挑战〛］` / `〚［本局挑战］〛`
- README/help overlay documentation for both pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new README/help assertions while the runtime label-cleanup behavior already passes.

### Task 2: Update the contract copy and backlog

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-square-white-design.md`
- Create: `docs/plans/2026-03-11-challenge-fullwidth-square-square-white-plan.md`

**Step 1: Write minimal implementation**

- Add both wrapper pairs to the grouped challenge decorator guidance in `README.md`.
- Mirror the same examples in the in-game help overlay string in `game.js`.
- Mark the first two active TODO items complete and leave the white tortoise-shell mixed wrapper queued next.

### Task 3: Verify and ship the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:
- `node --check game.js`
- `node --check data.js`
- `node --check shared/game-core.js`
- `node scripts/regression-checks.mjs`

**Step 2: Finish git delivery**

- Attempt local branch creation as `feat/auto-fullwidth-square-square-white`.
- If ref locks block local branch creation, keep the local work on the current branch, commit there, push `HEAD` to `origin/feat/auto-fullwidth-square-square-white`, then push `HEAD` to `origin/main`.

**Step 3: Append the mandatory audit line**

- Record tasks, branch request vs actual branch, tests, merge status, push status, and the git-lock blocker if it persists.
