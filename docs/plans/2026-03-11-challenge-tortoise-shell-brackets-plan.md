# Challenge Tortoise-Shell Brackets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend challenge/sidebar label cleanup so `〘〙` and `〚〛` decorator wrappers reuse the same stripping, repeated prefix dedupe, and `未知挑战` fallback behavior as the existing wrapper families.

**Architecture:** Keep the behavior centralized in `shared/game-core.js` by extending the shared decorator-pair table. Lock the contract with regression checks first, then sync `README.md` and the in-game help text in `game.js`.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Prioritize the active TODO lane

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-tortoise-shell-brackets-design.md`
- Create: `docs/plans/2026-03-11-challenge-tortoise-shell-brackets-plan.md`

**Step 1: Clarify the active items**

- Rename the existing `〘〙` item to its correct Unicode family name.
- Promote the adjacent `〚〛` wrapper family as the second active item so this cycle has two coherent tasks.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `〘挑战〙击败 30 个敌人` -> `击败 30 个敌人`
- `〘本局挑战〙挑战：本局` -> `未知挑战`
- `〚挑战〛击败 30 个敌人` -> `击败 30 个敌人`
- `〚本局挑战〛挑战：本局` -> `未知挑战`
- README/help overlay text explicitly mentioning both wrapper families

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new tortoise-shell / white-square wrapper assertions

### Task 3: Implement the shared decorator support

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Add `['〘', '〙']` and `['〚', '〛']` to `RUN_CHALLENGE_DECORATOR_PAIRS`.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: new regression cases pass once the helper recognizes both wrapper families

### Task 4: Sync documentation and bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs/help copy**

- Add `〘挑战〙` / `〘本局挑战〙` and `〚挑战〛` / `〚本局挑战〛` to the grouped challenge decorator documentation.

**Step 2: Close the cycle**

- Mark both active TODO items complete with timestamps.
- Run the required verification command.
- Commit changes, try local merge to `main`, push `main`, and if git ref/index locks block the local branch flow, push `HEAD` to the requested feature branch name and record the blocker in `PROGRESS.log`.
