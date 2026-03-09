# Invalid-Target No-Reward Visible Challenge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make visible run-challenge summaries explicitly preserve rewardless invalid-target state-first copy across regular, compact, and ultra-compact layouts while documenting and regression-locking the behavior.

**Architecture:** Keep the current run-challenge formatting pipeline in `shared/game-core.js`, but extract tiny shared helpers for invalid-target visible summaries so the no-reward behavior is intentional rather than incidental. Then expand regression assertions and sync the README/help overlay wording to the same fallback ladders.

**Tech Stack:** Plain JavaScript, shared formatter helpers in `shared/game-core.js`, lightweight Node regression script in `scripts/regression-checks.mjs`

---

### Task 1: In-Progress No-Reward Invalid-Target Visible Fallbacks

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression assertions that require the docs/help text to mention the rewardless in-progress invalid-target fallbacks and require the formatter helpers to keep explicit state-first copy.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new rewardless invalid-target in-progress assertions.

**Step 3: Write minimal implementation**

Add a small shared helper in `shared/game-core.js` for rewardless invalid-target in-progress visible summaries, then update `README.md` and the help overlay text in `game.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add shared/game-core.js scripts/regression-checks.mjs README.md game.js TODO.md docs/plans/2026-03-09-invalid-target-no-reward-visible-challenge-*.md
git commit -m "test: document rewardless invalid-target in-progress challenge fallbacks"
```

### Task 2: Completed No-Reward Invalid-Target Visible Fallbacks

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression assertions that require the docs/help text to mention the rewardless completed invalid-target fallbacks and require the formatter helpers to keep explicit completed-state copy.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new rewardless invalid-target completed assertions.

**Step 3: Write minimal implementation**

Add a matching shared helper in `shared/game-core.js` for rewardless invalid-target completed visible summaries, then sync `README.md` and the help overlay text in `game.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add shared/game-core.js scripts/regression-checks.mjs README.md game.js TODO.md docs/plans/2026-03-09-invalid-target-no-reward-visible-challenge-*.md
git commit -m "test: document rewardless invalid-target completed challenge fallbacks"
```
