# Challenge Nested Square Mixed Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the next two nested square-based challenge decorator families into the documented contract while leaving one follow-up active.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`; add regression assertions first so the missing README/help examples fail, then update the user-facing copy and close out the first two TODO items without changing unrelated challenge fallback behavior.

**Tech Stack:** Plain JavaScript, Node CLI regression script, Markdown docs.

---

### Task 1: Rebuild the queue and add failing contract coverage

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`
- Create: `docs/plans/2026-03-11-challenge-nested-square-mixed-design.md`

**Step 1: Write the failing test**

Add regression assertions for:
- `getRunChallengeSafeSidebarLabel('【（挑战）】击败 30 个敌人')`
- `getRunChallengeSafeSidebarLabel('（［本局挑战］）挑战：本局')`
- `getRunChallengeSafeSidebarLabel('【｛挑战｝】击败 30 个敌人')`
- `getRunChallengeSafeSidebarLabel('｛［本局挑战］｝挑战：本局')`
- README/help overlay mentions for both nested wrapper families

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because README/help overlay do not mention the two new nested wrapper examples yet.

### Task 2: Update the user-facing contract

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the nested square/parenthesis and nested square/curly examples to the grouped decorator cleanup copy in both README and the in-game help overlay.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new contract assertions.

### Task 3: Full verification and delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completed items**

Move the first two active TODO items into `Completed` with timestamps, leaving the nested square/angle mixed follow-up active.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit and integrate**

Use non-interactive git commands. If local branch creation or local main checkout is blocked by ref-lock permissions, keep working on the current branch and use remote push fallbacks while recording the blocker in `PROGRESS.log`.
