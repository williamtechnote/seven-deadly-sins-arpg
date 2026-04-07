# 烙痕圣坛 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a status-routing event room that pushes the run into stronger burn or bleed specials with readable HUD and payoff cues.

**Architecture:** Extend `shared/game-core.js` with a new blessing room and neutral run-effect keys, lock the contract in `scripts/regression-checks.mjs`, then consume those effects in `game.js` when special-status payloads are created and when status application is resolved against enemies or bosses.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Lock the shared status-routing contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`

**Step 1: Write the failing test**

- Add regression checks for neutral burn/bleed route keys.
- Add a new `烙痕圣坛` contract with `余烬修习` and `血痕修习`.
- Assert compact HUD summary lines stay readable.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing status-routing defaults/room.

**Step 3: Write minimal implementation**

- Add the new room and run-effect keys.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: status-routing room assertions pass.

### Task 2: Wire runtime status payload scaling and payoff cues

**Files:**
- Modify: `game.js`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Assert special hitboxes scale burn/bleed payload duration and source damage from run effects.
- Assert enemy/boss status application adds route-specific payoff cues.
- Assert `特攻 O` shows route identity or mismatch prompts.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing runtime/HUD hooks.

**Step 3: Write minimal implementation**

- Scale matching special-status payloads in `_spawnHitbox`.
- Add payoff cues in existing enemy/boss hit-resolution paths.
- Surface route identity in `getCombatSpecialStatusLabel`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: runtime/HUD assertions pass.

### Task 3: Update docs, TODO, and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

- Document the new shrine in README’s HUD, room-roster, and regression-contract sections.
- Mark the status-routing slice complete in TODO and advance the next abnormal-status follow-up.

**Step 2: Verify**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit**

```bash
git add README.md TODO.md PROGRESS.log docs/plans/2026-04-06-status-routing-shrine-design.md docs/plans/2026-04-06-status-routing-shrine-plan.md game.js shared/game-core.js scripts/regression-checks.mjs
git commit -m "feat: add status-routing shrine"
```
