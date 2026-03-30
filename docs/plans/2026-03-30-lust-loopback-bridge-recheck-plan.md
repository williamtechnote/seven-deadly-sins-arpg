# Lust Loopback Bridge Recheck Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3's `mirageDance -> reverseControl` loopback bridge again so the next `reverseControl` keeps yielding to `dash` / `charmBolt` for one more beat after the shared-recovery return pass.

**Architecture:** Keep the change inside Lust's phase-3 attack-order data in `data.js`, then lock the new contract with targeted regression assertions in `scripts/regression-checks.mjs`. Sync the player-facing explanation in `README.md`, and update heartbeat tracking in `TODO.md` and `PROGRESS.log`.

**Tech Stack:** Phaser 3 runtime, plain JavaScript, Node CLI regression checks

---

### Task 1: Lock the longer loopback bridge in tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Extend the expected `mirageDance -> reverseControl` attack slice by one more `dash`, `charmBolt` pair.
- Raise the focused loopback-bridge follow-up assertion from `24` to `26`.
- Update the README wording assertion to require one more added `dash` / `charmBolt` pair in the loopback description.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the loopback-bridge assertions and README wording.

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

- Replace the observation-only active item with the concrete loopback-bridge task before implementation.
- Mark the loopback-bridge task complete after delivery.
- Add the next observation as the only active TODO.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Integrate**

- Attempt to create `feat/auto-lust-loopback-bridge-recheck`.
- Commit on the actual working branch if local branch creation is still blocked by sandbox lock files.
- Attempt local merge to `main`.
- If local branch or merge operations fail again, verify `origin/main` is an ancestor of `HEAD`, then push `HEAD` to `feat/auto-lust-loopback-bridge-recheck` and `main` without deleting any feature branch.
