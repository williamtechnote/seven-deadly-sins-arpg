# Challenge White-Square And Shell Mixed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested square + white-square and nested square + shell challenge decorators across regression checks, README/help text, and TODO bookkeeping, while leaving nested square + lenticular mixed wrappers queued next.

**Architecture:** Keep runtime behavior unchanged in `shared/game-core.js` because the decorator table already supports these wrapper families. This cycle only formalizes the contract through tests, documentation, and heartbeat audit artifacts.

**Tech Stack:** Plain JavaScript, Phaser 3 help overlay copy, Node regression checks

---

### Task 1: Rebuild the active TODO queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-white-square-shell-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-white-square-shell-mixed-plan.md`

**Step 1: Update Active TODOs**

- Keep `nested square/white square bracket mixed decorator wrappers` first.
- Promote `nested square/shell mixed decorator wrappers` as the second active item.
- Leave `nested square/lenticular mixed decorator wrappers` queued third.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions proving:
- white-square mixed wrappers strip and still fall back to `未知挑战` when exhausted
- shell mixed wrappers strip and still fall back to `未知挑战` when exhausted
- regular summary builders strip both mixed wrappers
- README/help overlay explicitly mention both mixed-wrapper examples

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass; regression checks fail because the new README/help assertions are not yet satisfied

### Task 3: Implement the contract updates

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Write minimal implementation**

- Add white-square and shell mixed-wrapper examples to the grouped challenge decorator copy in `README.md`.
- Mirror the same examples in the help-overlay text in `game.js`.
- Mark the first two active TODO items complete with timestamps and leave the lenticular mixed wrapper item active.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Finish the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Attempt git delivery**

- Attempt local branch creation as `feat/auto-challenge-white-square-shell-mixed`.
- If git ref locks block local branch creation, keep working on the current branch, commit there, push `HEAD` to `origin/feat/auto-challenge-white-square-shell-mixed`, then fetch/push `main` using the existing fallback pattern.

**Step 2: Append the mandatory audit line**

- Record implemented tasks, branch request vs actual branch, test result, merge status, push status, and the git-lock blocker if it persists.
