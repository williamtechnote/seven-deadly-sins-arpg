# 武备圣坛 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a weapon-routing event room that pushes runs toward melee attack cadence or ranged special cadence.

**Architecture:** Extend shared event-room/run-effect contracts in `shared/game-core.js` with weapon-type-specific cooldown multipliers, lock the new room and runtime hooks in `scripts/regression-checks.mjs`, then consume the effects in `game.js` by checking the currently equipped weapon type before applying cooldown scaling or HUD route labels.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Lock the new shrine contract with failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- neutral defaults for melee-attack and ranged-special routing multipliers
- `武备圣坛` exposing `压阵修习 / 离弦修习`
- both choices resolving to the expected weapon-type-specific run effects
- unresolved HUD summaries surfacing compact weapon-routing copy

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new weapon-routing shrine assertions

**Step 3: Write minimal implementation**

Add the new shrine plus run-effect keys in `shared/game-core.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: weapon-routing shrine assertions pass

### Task 2: Lock runtime weapon-type hooks and HUD labels with failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add source assertions for:

- `tryAttack()` applying `playerMeleeAttackCooldownMultiplier` only when `weapon.type === 'melee'`
- `trySpecialAttack()` applying `playerRangedSpecialCooldownMultiplier` only when `weapon.type === 'ranged'`
- combat HUD status helpers exposing active/mismatch copy for both routes

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new runtime/HUD source assertions

**Step 3: Write minimal implementation**

Teach `game.js` to gate the cooldown scaling and HUD labels on the equipped weapon type.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: runtime/HUD assertions pass

### Task 3: Update heartbeat docs and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Record the new shrine, move the weapon-routing gap into completed work, and set the next adjacent priority.

**Step 2: Verify**

Run exactly: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 3: Commit**

Create a focused feature commit on `feat/auto-weapon-routing-shrine`.
