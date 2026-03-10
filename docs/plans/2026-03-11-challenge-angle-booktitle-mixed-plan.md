# Challenge Angle Book-Title Mixed Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested square+angle and nested square+book-title challenge decorator wrappers across regression checks, README/help docs, and TODO bookkeeping while reusing the existing recursive label stripper.

**Architecture:** Keep the runtime behavior centralized in `shared/game-core.js` and first prove the uncovered wrapper families with failing regression cases. If those cases already pass in the helper, treat the work as contract synchronization: update the grouped README/help text and close the first two active TODO items while leaving the next nested family queued.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Reprioritize the wrapper backlog

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-angle-booktitle-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-angle-booktitle-mixed-plan.md`

**Step 1: Record the next three nested-wrapper candidates**

- Keep `nested square/angle mixed decorator wrappers` first.
- Promote `nested square/book-title mixed decorator wrappers` as the second active item.
- Leave `nested square/corner-quote mixed decorator wrappers` queued as the next follow-up.

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `【＜挑战＞】击败 30 个敌人` -> `击败 30 个敌人`
- `＜［本局挑战］＞挑战：本局` -> `未知挑战`
- `【《挑战》】击败 30 个敌人` -> `击败 30 个敌人`
- `〈［本局挑战］〉挑战：本局` -> `未知挑战`
- full/compact summary helpers reusing the same cleanup path
- README/help overlay text explicitly mentioning both nested wrapper families

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new nested angle/book-title contract assertions if docs are still behind.

### Task 3: Implement the minimal fix

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new contract reveals a real runtime gap)

**Step 1: Write minimal implementation**

- If the helper already passes the new nested wrapper cases, keep runtime code unchanged and only sync the grouped wrapper documentation.
- If any runtime case fails, extend the shared decorator logic minimally in `shared/game-core.js` rather than patching the UI call sites separately.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: the helper, README assertions, and help-overlay assertions all pass for the two promoted nested wrapper families.

### Task 4: Close the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completed backlog items**

- Mark the first two active TODO items complete with the current timestamp.
- Leave the corner-quote mixed wrapper item active.

**Step 2: Delivery bookkeeping**

- Attempt `git switch -c feat/auto-challenge-angle-booktitle-mixed`.
- If local branch creation is blocked by git lock permissions, keep working on the current branch, push `HEAD` to `origin/feat/auto-challenge-angle-booktitle-mixed`, and record the blocker in `PROGRESS.log`.
- After verification, commit changes, attempt merge/push to `main`, and append the mandatory audit line with exact test, merge, push, and blocker status.
