# Challenge Extra Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run challenge label cleanup to cover curly-brace and book-title decorators while keeping docs and regressions aligned.

**Architecture:** Keep the production change in `shared/game-core.js` by widening the existing decorator regex rather than adding new branches. Write failing regression tests first in `scripts/regression-checks.mjs`, then update `README.md` and the in-game help copy in `game.js` to match the shared behavior.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser UI text, Node regression checks

---

### Task 1: Rebuild the active TODO queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-10-challenge-extra-decorators-design.md`

**Step 1: Update Active TODOs**

Record the three adjacent decorator follow-ups in priority order: curly-brace, book-title, then shell/lenticular.

**Step 2: Save the design note**

Document why broadening the existing regex is safer than splitting the normalization pipeline.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that prove:
- curly-brace decorators strip before the existing plain-text prefix cleanup
- book-title decorators strip before the existing prefix cleanup and still fall back to `未知挑战` when exhausted
- README and help overlay mention both new decorator paths

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current regex does not include curly-brace or book-title wrappers and the docs do not mention them.

### Task 3: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the existing decorator regex to include `{}` / `｛｝` and `《》` / `〈〉`, keeping the rest of the cleanup chain unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new decorator assertions.

### Task 4: Sync docs and finish the cycle

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Add curly-brace and book-title decorator examples to README and the in-game help overlay explanation.

**Step 2: Close the first two TODOs**

Move the curly-brace and book-title items to `Completed` with timestamps; leave the shell/lenticular item active.

**Step 3: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 4: Attempt git delivery**

Try to commit, merge to `main`, and push. If git lock permissions block local branch/commit/merge operations, attempt at least one fallback and record the blocker in `PROGRESS.log`.
