# Lust Phase 3 Five-Breather Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the latest Lust phase-3 pacing observation into three concrete backlog items, then implement the first two by requiring five light-pressure attacks between major specials and by further biasing the phase-3 sequence toward `charmBolt` / `dash`.

**Architecture:** Keep the boss runtime unchanged. Update the existing Lust phase-3 data contracts in `data.js`, write failing regression assertions in `scripts/regression-checks.mjs` first, and then sync `README.md` and `TODO.md` so the tuning remains auditable.

**Tech Stack:** Plain JavaScript, Phaser 3 runtime data, Node-based regression script

---

### Task 1: Split the active TODO into three concrete follow-ups

**Files:**
- Modify: `TODO.md`
- Modify: `docs/plans/2026-03-11-lust-phase3-five-breather-design.md`

**Step 1: Write the backlog split**

Add `十八-一 / 十八-二 / 十八-三` to the active section and mark `十七-三` completed as the observation that got split.

**Step 2: Verify ordering**

Check that the first two active items are the ones that will be implemented in this cycle.

### Task 2: Lock the five-breather contract with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Change the Lust phase-3 breather-chain assertion from `4` to `5`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old four-breather assertion.

**Step 3: Write minimal implementation**

Change `BOSSES.lust.phases[2].postMajorBreatherChain.requiredCount` to `5`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the five-breather assertion.

### Task 3: Lock the heavier light-pressure sequence with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Update the exact Lust phase-3 `attacks` assertion to require one more `charmBolt` / `dash` bridge before the loop restarts.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old phase-3 attack order.

**Step 3: Write minimal implementation**

Extend the phase-3 `attacks` array in `data.js` to match the new sequence.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new attack-order assertion.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update README wording**

Document the five-breather chain and the extra light-pressure weighting.

**Step 2: Mark completed TODO items**

Move `十八-一 / 十八-二` to completed with timestamps and leave `十八-三` active.

### Task 5: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Review and ship**

Request code review, commit, merge/push if possible, or record the fallback/blocker exactly.
