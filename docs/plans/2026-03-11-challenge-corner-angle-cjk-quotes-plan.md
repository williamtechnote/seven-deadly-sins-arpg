# Challenge Corner-Angle CJK Quote Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested `corner-angle` + half-width corner-quote and presentation-form challenge decorators across regression checks, README/help text, and TODO bookkeeping while preserving the shared normalization path.

**Architecture:** Treat this as a contract-locking cycle unless the new tests expose a parser gap. `shared/game-core.js` already carries both quote families in its decorator pair table, so the likely work is regression coverage, help/README copy, and heartbeat audit updates.

**Tech Stack:** Plain JavaScript, Phaser 3 help overlay copy, Node regression checks

---

### Task 1: Capture the heartbeat lane

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-cjk-quotes-design.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-cjk-quotes-plan.md`

**Step 1: Rebuild the active queue**

- Keep `nested corner-angle/half-width corner-quote mixed decorator wrappers` first.
- Keep `nested corner-angle/presentation-form mixed decorator wrappers` second.
- Leave the next wrapper family queued after these two are complete.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions proving:
- `〈｢挑战｣〉...` and `｢〈本局挑战〉｣...` normalize correctly
- `〈﹁挑战﹂〉...` and `﹃〈本局挑战〉﹄...` normalize correctly
- regular/compact sidebar builders strip both nested wrapper families
- README/help overlay explicitly mention both mixed-wrapper examples

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass; regression checks fail because README/help assertions are not yet satisfied

### Task 3: Implement the contract updates

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Write minimal implementation**

- Add the two new `corner-angle` mixed-wrapper examples to the grouped challenge decorator copy in `README.md`
- Mirror those examples in the help-overlay copy in `game.js`
- Mark the two active TODO items complete with timestamps and queue the next wrapper family

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Finish the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Attempt git delivery**

- Attempt local branch creation as `feat/auto-corner-angle-cjk-quotes`
- If git ref locks block local branch creation, keep working on the current branch, commit there, push `HEAD` to `origin/feat/auto-corner-angle-cjk-quotes`, then push `main` with the existing fallback pattern

**Step 2: Append the mandatory audit line**

- Record implemented items, requested vs actual branch, test result, merge status, push status, and the git-lock blocker if it persists
