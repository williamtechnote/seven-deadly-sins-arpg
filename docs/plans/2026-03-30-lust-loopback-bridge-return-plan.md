# Lust Loopback Bridge Return Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3's `mirageDance -> reverseControl` loopback bridge again so the next `reverseControl` re-entry keeps yielding to light pressure after the longer `illusion` recovery follow-up.

**Architecture:** Keep the change inside Lust's phase-3 `attacks` data in `data.js`. Lock the pacing contract with the existing regression checks in `scripts/regression-checks.mjs`, then sync the player-facing explanation in `README.md` and heartbeat tracking in `TODO.md` / `PROGRESS.log`.

**Tech Stack:** Phaser 3 runtime, plain JavaScript, Node CLI regression checks

---

### Task 1: Lock the longer loopback bridge in tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Extend the expected `mirageDance -> reverseControl` slice in the phase-3 attack-order assertion by one more `dash` / `charmBolt` pair.
- Raise the focused loopback-bridge follow-up assertion from 20 to 22 attacks after `mirageDance`.
- Update the README wording assertion to require a third extra `dash` / `charmBolt` pair in the loopback bridge description.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new loopback-bridge contract and README wording.

**Step 3: Write minimal implementation**

- Add one more `dash`, `charmBolt` pair after `mirageDance` in `data.js`.
- Update the Lust phase-3 pacing paragraph in `README.md`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update task tracking**

- Mark observation eighty-three complete because it led to the new loopback-bridge pass.
- Mark loopback bridge eighty-four complete after implementation.
- Add observation eighty-five as the next active item.

**Step 2: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit**

```bash
git add TODO.md PROGRESS.log README.md data.js scripts/regression-checks.mjs docs/plans/2026-03-30-lust-loopback-bridge-return-design.md docs/plans/2026-03-30-lust-loopback-bridge-return-plan.md
git commit -m "feat: extend lust loopback bridge return"
```
