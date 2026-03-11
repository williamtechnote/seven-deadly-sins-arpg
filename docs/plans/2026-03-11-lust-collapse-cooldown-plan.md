# Lust Collapse Cooldown Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce `魅惑女妖` phase 3 second-round density by lengthening `mirageDance`'s reverse-wave collapse and raising the existing phase-local cooldowns.

**Architecture:** Keep the attack-selector behavior unchanged. Update the existing Lust phase 3 cooldown metadata in `data.js`, retune the `mirageDance` finisher collapse constant in `game.js`, and lock both changes through source-hook regressions plus README/TODO sync.

**Tech Stack:** Phaser 3 runtime in `game.js`, static boss data in `data.js`, CLI regressions in `scripts/regression-checks.mjs`, Markdown docs.

---

### Task 1: Lock the stronger phase-local cooldown contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`

**Step 1: Write the failing test**

Update the Lust phase 3 cooldown assertions to require the new higher values for `reverseControl`, `illusion`, and `mirageDance`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the old cooldown values are still present.

**Step 3: Write minimal implementation**

Raise only the three existing cooldown constants in phase 3 boss data.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated cooldown assertions.

### Task 2: Lock the longer reverse-wave collapse

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `game.js`

**Step 1: Write the failing test**

Require the `mirageDance` executor to use a longer `collapseMs` value.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the old collapse duration is still in source.

**Step 3: Write minimal implementation**

Increase only the reverse-wave collapse constant and keep the rest of the finisher behavior intact.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated collapse assertion.

### Task 3: Sync docs and backlog state

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Reprioritize the backlog**

Replace the single active observation item with three ordered tasks, then leave one observation item active after the first two ship.

**Step 2: Update user-facing docs**

Document the longer reverse-wave collapse and the stronger phase-local cooldown spacing in Lust phase 3.

**Step 3: Verify the required bundle**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
