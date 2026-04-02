# 战技圣坛 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new event-room blessing that creates a clear aggressive-vs-evasive run identity through basic-attack cadence and dodge economy.

**Architecture:** Extend shared run-effect contracts in `shared/game-core.js`, lock them with regression tests in `scripts/regression-checks.mjs`, then consume the new multipliers in `game.js` where attack cooldowns, dodge costs/cooldowns, and the combat HUD are computed.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Define the new room and run-effect contract

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression expectations for:

- `RUN_EVENT_ROOM_POOL` now containing `战技圣坛`
- `连斩修习` producing `playerAttackCooldownMultiplier`
- `游步修习` producing `playerDodgeCooldownMultiplier` and `playerDodgeStaminaCostMultiplier`
- summary text emitting readable labels for the new run effects

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new event-room/run-effect assertions

**Step 3: Write minimal implementation**

Add the new room to the pool, extend `DEFAULT_RUN_EFFECTS`, and update effect-summary helpers to name the new multipliers.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: new assertions pass

### Task 2: Apply the run effects in runtime combat

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression checks that inspect `game.js` for:

- attack cooldown scaling by `playerAttackCooldownMultiplier`
- dodge cooldown scaling by `playerDodgeCooldownMultiplier`
- dodge stamina cost scaling by `playerDodgeStaminaCostMultiplier`
- HUD state using the scaled dodge cooldown/cost

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new runtime hook assertions

**Step 3: Write minimal implementation**

Apply the multipliers where player attack/dodge state is computed and where the action HUD input state is assembled.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: runtime hook assertions pass

### Task 3: Update player-facing docs and heartbeat tracking

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Create: `docs/gameplay-run-variety-principles.md`

**Step 1: Update docs**

Document the new room and the gameplay rationale without bloating the README.

**Step 2: Verify**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit**

Commit with a `feat:` message once verification is green.
