# Challenge Lenticular And Curly-Quote Mixed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested square + lenticular and nested square + curly double-quote challenge decorators across regression checks, README/help text, and TODO bookkeeping, while leaving nested square + curly single-quote mixed wrappers queued next.

**Architecture:** Assume runtime behavior already exists in `shared/game-core.js` because the recursive decorator table includes `〖〗` and `“”`. Use contract-first TDD: add failing regression/doc assertions, update docs/help to satisfy them, and only modify runtime code if the new mixed-wrapper cases expose a real gap.

**Tech Stack:** Plain JavaScript, Phaser 3 help overlay copy, Node regression checks

---

### Task 1: Rebuild the active TODO queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-lenticular-curly-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-lenticular-curly-mixed-plan.md`

**Step 1: Update Active TODOs**

- Keep `nested square/lenticular mixed decorator wrappers` first.
- Promote `nested square/curly double-quote mixed decorator wrappers` as the second active item.
- Leave `nested square/curly single-quote mixed decorator wrappers` queued third.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions proving:
- lenticular mixed wrappers strip and still fall back to `未知挑战` when exhausted
- curly double-quote mixed wrappers strip and still fall back to `未知挑战` when exhausted
- regular summary builders strip both mixed wrappers
- README/help overlay explicitly mention both mixed-wrapper examples

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass; regression checks fail because the new README/help assertions are not yet satisfied

### Task 3: Implement the contract updates

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new assertions reveal a runtime gap)
- Modify: `TODO.md`

**Step 1: Write minimal implementation**

- Add lenticular and curly double-quote mixed-wrapper examples to the grouped challenge decorator copy in `README.md`.
- Mirror the same examples in the help-overlay text in `game.js`.
- Mark the first two active TODO items complete with timestamps and leave the curly single-quote mixed wrapper item active.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Finish the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Attempt git delivery**

- Attempt local branch creation as `feat/auto-challenge-lenticular-curly-mixed`.
- If local branch creation is blocked by git ref locks, keep working on the current branch, commit there, push `HEAD` to `origin/feat/auto-challenge-lenticular-curly-mixed`, then fetch/push `main` using the existing fallback pattern.

**Step 2: Append the mandatory audit line**

- Record implemented tasks, branch request vs actual branch, test result, merge status, push status, and the git-lock blocker if it persists.
