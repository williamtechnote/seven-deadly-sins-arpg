# Challenge Angle Decorator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run challenge label cleanup to strip angle-bracket decorators and keep docs/regressions aligned with the shared fallback chain.

**Architecture:** Keep the production change inside `shared/game-core.js` by broadening the existing decorator regex. Add failing tests first in `scripts/regression-checks.mjs`, then update `README.md` and the in-game help copy in `game.js` so the documented behavior matches the shared helper.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser UI text, Node regression script

---

### Task 1: Align the active TODOs

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-10-challenge-angle-decorator-design.md`

**Step 1: Update the active TODO list**

Promote the code item, the README/help sync, and the regression follow-up into the active queue.

**Step 2: Save the design note**

Record why widening the existing decorator regex is safer than introducing another normalization branch.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that prove:
- ASCII `<挑战>` and full-width `＜本局挑战＞` decorators are stripped before the existing plain-text prefix cleanup runs
- mixed angle-bracket + plain-text prefixes still collapse to `未知挑战`
- README and help overlay mention the angle-bracket decorator cleanup path

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current decorator regex does not include angle brackets and the docs do not mention them.

### Task 3: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend the existing decorator regex to include ASCII `< >` and full-width `＜ ＞`, keeping the rest of the cleanup chain unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new angle-bracket assertions.

### Task 4: Sync docs and deliver

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Add angle-bracket decorator examples to the README and in-game help overlay explanation.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 3: Attempt git delivery**

Try to create/publish `feat/auto-challenge-angle-decorator-cleanup`. If local ref creation is still blocked, record the blocker and use the fallback of pushing `HEAD` to that remote branch name after commit.
