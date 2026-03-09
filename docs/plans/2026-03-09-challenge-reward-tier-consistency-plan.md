# Challenge Reward Tier Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reuse the shared run-challenge reward short-label helper in regular and compact sidebar summaries so future compound rewards stay consistent across tiers.

**Architecture:** Keep the existing reward helper and fallback ladders intact, but route the regular reward detail line and compact completed summary through that helper. Lock the behavior with regression coverage and sync the README plus in-game help copy.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Red tests for cross-tier reward-label reuse

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add coverage that asserts:
- regular challenge summaries show `rewardLabel` verbatim on the reward line when provided;
- compact completed summaries show the same `rewardLabel` instead of the legacy gold-only copy.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because regular and compact currently hardcode gold-only reward strings.

### Task 2: Minimal shared-helper implementation

**Files:**
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Reuse `formatRunChallengeRewardShortLabel` in:
- the regular reward-detail line;
- the compact completed second line.

Keep compact in-progress copy unchanged.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new regular/compact reward-label coverage.

### Task 3: Heartbeat delivery

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Sync TODO**

Mark the first two active items complete and leave the compact in-progress evaluation follow-up active.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Use `feat/auto-challenge-reward-tier-consistency` if local refs permit creation; otherwise record the ref-lock blocker and push the current HEAD to that remote branch name before merging/pushing `main`.

**Step 4: Append audit**

Record implemented items, requested/actual branch outcome, test result, merge status, push status, and blocker/fallback in `PROGRESS.log`.
