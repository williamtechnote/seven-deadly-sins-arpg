# Lust Mirage Cooldown Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the `魅惑女妖` phase 3 local-cooldown pass by adding `mirageDance` to the existing cooldown metadata and locking the full three-special pacing contract in regression checks and README.

**Architecture:** Reuse the existing `phaseLocalCooldownMs` hook in `data.js` and the already-shipped selector/finish plumbing in `game.js`. Add failing regression assertions first, then wire the new cooldown value and align README/TODO wording with the completed three-special contract.

**Tech Stack:** Phaser 3 runtime in `game.js`, static boss data in `data.js`, CLI regression hooks in `scripts/regression-checks.mjs`, docs in Markdown.

---

### Task 1: Add mirageDance cooldown coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Add assertions that `BOSSES.lust.phases[2].phaseLocalCooldownMs.mirageDance` exists with the chosen cooldown value.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing `mirageDance` cooldown metadata.

**Step 3: Write minimal implementation**

Add the `mirageDance` cooldown entry to Lust phase 3 without changing the selector logic.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `mirageDance` cooldown assertion.

### Task 2: Lock the full three-special cooldown contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add assertions that README documents `reverseControl`, `illusion`, and `mirageDance` as the completed phase-local cooldown trio.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on outdated README wording.

**Step 3: Write minimal implementation**

Update README/TODO wording to describe the completed cooldown trio and the next follow-up observation item.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated README contract assertions.
