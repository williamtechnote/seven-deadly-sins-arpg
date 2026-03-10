# Challenge CJK Quote Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend run challenge label cleanup to strip half-width corner-quote and presentation-form quote decorators while keeping docs and regressions aligned.

**Architecture:** Keep the production change inside `shared/game-core.js` by widening the existing decorator pair list rather than introducing a second normalization branch. Add failing tests first in `scripts/regression-checks.mjs`, then update `README.md` and the in-game help copy in `game.js` so the documented behavior matches the shared helper.

**Tech Stack:** Plain JavaScript, shared browser/CLI helpers, Phaser UI text, Node regression checks

---

### Task 1: Rebuild the active TODO queue and capture the design

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-10-challenge-cjk-quote-decorators-design.md`

**Step 1: Update Active TODOs**

Record the three adjacent CJK quote-wrapper follow-ups in priority order: `｢｣`, `﹁﹂` / `﹃﹄`, then `〝〞`.

**Step 2: Save the design note**

Document why broadening the existing decorator pair list is safer than splitting the normalization pipeline.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that prove:
- half-width corner-quote decorators strip before the existing plain-text prefix cleanup
- presentation-form quote decorators strip before the existing prefix cleanup and still fall back to `未知挑战` when exhausted
- README and help overlay mention both new wrapper families

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current decorator pair list does not include `｢｣`, `﹁﹂`, or `﹃﹄`, and the docs do not mention them.

### Task 3: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Extend `RUN_CHALLENGE_DECORATOR_PAIRS` to include `｢｣`, `﹁﹂`, and `﹃﹄`, keeping the rest of the cleanup chain unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new quote-wrapper assertions.

### Task 4: Sync docs and finish the cycle

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update user-facing docs**

Add `｢挑战｣`/`｢本局挑战｣` and `﹁挑战﹂`/`﹃本局挑战﹄` examples to README and the in-game help overlay explanation.

**Step 2: Close the first two TODOs**

Move the first two items to `Completed` with timestamps; leave the `〝〞` follow-up active.

**Step 3: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 4: Attempt git delivery**

Try to create/publish `feat/auto-challenge-cjk-quote-decorators`. If local ref creation or local main checkout/merge is still blocked, commit on the current branch, push `HEAD` to that remote branch name as a fallback, and record the blocker explicitly in `PROGRESS.log`.
