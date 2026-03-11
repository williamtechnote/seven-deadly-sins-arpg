# Lust Post-Mirage Spacing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce `魅惑女妖` phase 3 second-round special density by adding a post-`mirageDance` breather guard and a longer `mirageDance` settle window.

**Architecture:** Extend phase 3 boss data with one post-attack pacing rule, teach the existing selector to honor that rule when a breather exists, and slightly increase the `mirageDance` finisher delay. Lock both behaviors with regression hooks before implementation, then align README and TODO wording with the new pacing contract.

**Tech Stack:** Phaser 3 runtime in `game.js`, static boss data in `data.js`, CLI regression hooks in `scripts/regression-checks.mjs`, docs in Markdown.

---

### Task 1: Lock the post-mirage breather guard with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `game.js`

**Step 1: Write the failing test**

Add assertions that Lust phase 3 exposes `postAttackBreatherGuards.mirageDance`, and that the selector reads and applies the guard when an alternate breather exists.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing guard metadata/hooks.

**Step 3: Write minimal implementation**

Add the phase data and the selector check without disturbing the existing cooldown and major-special rules.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new guard assertions.

### Task 2: Lock the longer mirage settle window with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Update the `mirageDance` executor assertion to require the longer `finisherDelayMs`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the outdated settle delay.

**Step 3: Write minimal implementation**

Increase the settle delay constant and keep the rest of the branch unchanged.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated settle-delay assertion.

### Task 3: Sync docs and backlog state

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update the backlog ordering**

Rewrite the single active Lust follow-up into three ordered items, with the first two mapped to the implementation above and one remaining observation item kept active.

**Step 2: Update the user-facing docs**

Document that Lust phase 3 now inserts a guaranteed breather after `mirageDance` when possible and keeps a slightly longer finisher settle window.

**Step 3: Verify the bundle**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
