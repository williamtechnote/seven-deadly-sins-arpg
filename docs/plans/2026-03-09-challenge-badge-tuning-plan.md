# Ultra-Compact Challenge Badge Tuning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce ultra-compact challenge badge width pressure without removing the hidden-challenge fallback entirely.

**Architecture:** Keep the current shared badge helper and UIScene title integration. Change only the helper output/conditions, then update docs and regression coverage to match.

**Tech Stack:** Vanilla JavaScript, Phaser 3 HUD text, Node regression script

---

### Task 1: Zero-progress badge gating

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a regression asserting that `buildRunChallengeSidebarBadge(..., { viewportTier: 'ultraCompact', hidden: true })` returns an empty string when `progress === 0` and the challenge is not completed.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new zero-progress badge assertion.

**Step 3: Write minimal implementation**

Guard the ultra-compact active badge path so it stays silent until progress is greater than zero.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new badge gating assertion.

### Task 2: Shorter ultra-compact badge copy

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Update regression expectations so the ultra-compact hidden badge uses shorter progress/completion strings and the help/docs mention the new trigger/copy.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the updated badge wording or documentation assertion.

**Step 3: Write minimal implementation**

Return the shorter strings from the shared helper and update README/help text to describe the narrower badge behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Audit and branch fallback

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Verify the exact required command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Commit**

Commit the docs, code, tests, README, TODO, and audit log together once verification is fresh.

**Step 3: Merge / push fallback**

If local feature branch creation is still blocked, record the intended branch name and attempt the least-invasive fallback permitted by the environment.
