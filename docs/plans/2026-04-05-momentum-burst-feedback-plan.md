# 借势修习爆发命中反馈 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `借势修习` feel readable at the payoff moment by giving empowered specials distinct hit confirmation when the post-dodge burst window is actually consumed.

**Architecture:** Reuse the existing post-dodge empower flow in `game.js` instead of inventing another meter. Mark empowered specials at spawn time, branch the existing enemy/boss hit feedback just for that tagged hitbox, and lock the contract with regression checks plus concise docs/TODO updates.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the payoff-feedback contract with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add source assertions for:

- `trySpecialAttack()` forwarding an `isEmpoweredSpecial` flag when the consumed post-dodge multiplier is above `1`
- regular-enemy hit processing branching to `借势重击` feedback for empowered specials
- Boss hit processing branching to the same `借势重击` feedback for empowered specials

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new empowered-special feedback assertions

### Task 2: Implement the minimal runtime feedback

**Files:**
- Modify: `game.js`

**Step 1: Tag empowered special hitboxes**

Teach `trySpecialAttack()` / `_spawnHitbox()` to preserve whether the consumed post-dodge multiplier actually empowered this cast.

**Step 2: Branch hit feedback**

When an empowered special lands:

- use a brighter burst pulse on regular enemies and Bosses
- replace the generic special floating text with `借势重击`

Leave baseline special feedback unchanged when no empower was consumed.

**Step 3: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Update docs and heartbeat audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new `借势重击` payoff feedback, mark the task complete, and promote the next adjacent combat-readability follow-up.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-momentum-burst-feedback`.
