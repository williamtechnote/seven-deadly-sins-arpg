# Lust Six-Breather Bridge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the current Lust phase-3 pacing observation into three concrete TODO items, then implement the first two by requiring six light-pressure attacks after each major special and by lengthening the `mirageDance -> reverseControl` loopback bridge.

**Architecture:** Keep the boss runtime unchanged. Tighten `scripts/regression-checks.mjs` first so the six-breather guard and the longer loopback bridge both fail before implementation, then update the phase-3 data contract in `data.js` and align `README.md` / `TODO.md` with the new pacing language.

**Tech Stack:** Plain JavaScript, Phaser 3 runtime data, Node-based regression script

---

### Task 1: Split the active observation into ordered follow-ups

**Files:**
- Create: `docs/plans/2026-03-11-lust-six-breather-bridge-design.md`
- Modify: `TODO.md`

**Step 1: Write the backlog split**

Replace the single active observation with `二十五-一 / 二十五-二 / 二十五-三`, then mark `二十四-三` complete as the observation that got split.

**Step 2: Verify ordering**

Confirm the first two active items are the six-breather guard and the longer loopback bridge.

### Task 2: Lock the six-breather contract with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Change the Lust phase-3 breather-chain assertion from `5` to `6`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old five-breather assertion.

**Step 3: Write minimal implementation**

Change `BOSSES.lust.phases[2].postMajorBreatherChain.requiredCount` to `6`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the six-breather assertion.

### Task 3: Lock the longer loopback bridge with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Update the exact Lust phase-3 `mirageDance -> reverseControl` attack-order assertion to require one more trailing `dash` -> `charmBolt` pair.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the old loopback bridge assertion.

**Step 3: Write minimal implementation**

Append one extra `dash`, `charmBolt` pair to the end of the phase-3 `attacks` array in `data.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated loopback bridge assertion.

### Task 4: Sync docs for the new pacing contract

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update README wording**

Document the six-breather guard and the even longer `mirageDance -> reverseControl` loopback bridge.

**Step 2: Mark completed TODO items**

Move `二十五-一 / 二十五-二` to completed with timestamps and leave `二十五-三` active.

### Task 5: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Review and ship**

Commit, attempt merge/push, and if the local branch workflow remains blocked, record the exact fallback and blocker in `PROGRESS.log`.
