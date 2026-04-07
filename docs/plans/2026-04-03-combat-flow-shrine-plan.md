# 战势圣坛 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new blessing room that turns successful hits into stamina flow or dodges into a short special burst window.

**Architecture:** Extend shared run-effect composition in `shared/game-core.js` so it can represent additive combat hooks, lock the new room and HUD copy in `scripts/regression-checks.mjs`, then consume the effects in `game.js` where hit confirmation, dodge completion, special attacks, and HUD state are already computed.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Define the new shrine and additive run-effect contract

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression coverage for:

- new default run-effect keys for attack-hit stamina gain and post-dodge special empowerment
- `RUN_EVENT_ROOM_POOL` containing `战势圣坛`
- `回息修习` resolving to fixed stamina-on-hit gain
- `借势修习` resolving to post-dodge special damage + window duration
- HUD/summary helpers surfacing compact route copy for both choices

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new shrine/run-effect assertions

**Step 3: Write minimal implementation**

Add additive run-effect composition support, define the new room, and update summary helpers to preserve readable copy for the conditional route.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: new shrine assertions pass

### Task 2: Apply the new combat hooks in runtime and HUD

**Files:**
- Modify: `game.js`
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression checks for:

- normal-attack hits granting stamina from `playerAttackHitStaminaGain`
- dodge completion arming a timed special-empower window
- special attacks consuming `playerPostDodgeSpecialDamageMultiplier`
- action HUD copy surfacing an active `借势` state

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the runtime/HUD assertions

**Step 3: Write minimal implementation**

Add the smallest possible runtime hooks in the existing player combat flow and HUD state assembly.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: runtime and HUD assertions pass

### Task 3: Update docs and heartbeat audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new shrine, the follow-up gameplay rationale, and the new active/next items.

**Step 2: Verify**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit**

Commit with a `feat:` message once verification is green.
