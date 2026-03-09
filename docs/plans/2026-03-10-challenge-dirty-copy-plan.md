# Challenge Dirty Copy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden challenge/sidebar copy helpers against dirty separators in labels and additive-token spacing noise in explicit reward labels.

**Architecture:** Keep normalization in `shared/game-core.js` so every challenge/sidebar surface reuses the same sanitized strings. Lock behavior with regression tests first, then sync README/help overlay copy to the new guarantees.

**Tech Stack:** Plain JavaScript, Phaser 3 UI layer, Node-based regression checks

---

### Task 1: Seed heartbeat TODOs and write failing regression tests

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression cases for:
- `本局：挑战：：击败 30 个敌人` and `挑战： - 击败 30 个敌人` normalizing to the real body label
- separator-only labels collapsing to `未知挑战`
- explicit `rewardLabel` values like `+ 9999金　 + 净化` normalizing to `+9999金 +净化`

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new challenge/sidebar dirty-input assertions

### Task 2: Implement shared helper normalization

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Extend `normalizeRunChallengeSidebarLabel` to strip leading separator runs after each prefix-removal pass.
- Add shared additive-token reward normalization and reuse it from `formatRunChallengeRewardShortLabel`.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: regression checks pass with the new normalization behavior

### Task 3: Sync docs for the implemented guarantees

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update docs/help copy**

- Document orphan separator cleanup after repeated challenge-prefix dedupe
- Document additive reward token spacing normalization for explicit reward labels

**Step 2: Re-run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Finish heartbeat bookkeeping

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark implemented items complete and leave the third TODO active**

Move the first two Active TODOs to Completed with timestamps; keep the bracketed-prefix cleanup item in Active.

**Step 2: Commit / merge / push with fallback**

- Attempt normal commit flow on `feat/auto-challenge-dirty-copy-normalization`
- If local branch creation remains blocked, commit on the current branch, push a remote fallback feature branch, and record the blocker in `PROGRESS.log`
