# Compact Challenge Semantic Fallback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a width-aware semantic fallback for the compact in-progress run-challenge detail line so narrow sidebars keep the challenge label before generic truncation.

**Architecture:** Keep the existing two-line compact layout, but make the second line use `pickChallengeLabelVariant()` with compact-specific variants built from the normalized challenge label plus the shared reward short label. Prove the behavior with regression checks, then sync README/help copy and heartbeat logs.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD scene, Node regression script

---

### Task 1: Red test for compact semantic fallback

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regressions asserting the compact in-progress second line:

- keeps `击败 30 个敌人 · +90金` when width allows;
- falls back to `击败 30 个敌人` when the second-line budget tightens;
- reuses the same fallback for `+9999金 +净化`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `buildRunChallengeSidebarLines()` currently ignores `maxLineWidth` in compact mode.

### Task 2: Minimal implementation

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add one compact-detail variant helper and route the compact in-progress second line through `pickChallengeLabelVariant()` using the measured sidebar width.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new compact assertions.

### Task 3: TODO and delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the compact in-progress semantic fallback and its regression guard complete; leave the compact completed-state evaluation as the next active item.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use requested branch name `feat/auto-compact-challenge-semantic-fallback`; if local creation is blocked again, keep the fallback pattern recorded in `PROGRESS.log`.
