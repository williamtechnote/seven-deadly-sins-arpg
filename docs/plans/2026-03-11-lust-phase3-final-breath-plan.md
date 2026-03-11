# Lust Phase 3 Final Breath Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the remaining Lust phase-3 pacing observation into three concrete TODO items, then implement the first two by extending shared recovery and the `mirageDance -> reverseControl` light-pressure bridge.

**Architecture:** Keep the change data-driven. Update Lust phase-3 metadata in `data.js`, lock the new expectations in `scripts/regression-checks.mjs`, and sync the player-facing pacing contract in `README.md` and `TODO.md`.

**Tech Stack:** Phaser 3, plain JavaScript, custom Node regression script

---

### Task 1: Lock the stronger shared recovery guard

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Change the Lust shared-recovery assertion to the new target value and tighten the README wording to describe the extra pause after the five-breather loopback.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the Lust shared-recovery assertion and README wording until source/docs are updated.

**Step 3: Write minimal implementation**

Raise `BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial` and sync the README sentence.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the shared-recovery checks.

### Task 2: Lock the longer `mirageDance -> reverseControl` loopback bridge

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`

**Step 1: Write the failing test**

Update the exact Lust phase-3 attack-order assertion so the loopback after `mirageDance` requires one more `charmBolt` / `dash` handoff.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the Lust phase-3 attack-order assertion until the attack list is extended.

**Step 3: Write minimal implementation**

Append one extra light-pressure bridge entry after `mirageDance` in the phase-3 `attacks` array and document the longer loopback bridge in the README.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated attack-order and README checks.

### Task 3: Leave the next observation queued

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Keep the third split item active**

After implementing Tasks 1-2, mark them complete and leave the new observation item active.

**Step 2: Audit the run**

Append the required heartbeat audit line to `PROGRESS.log` with branch fallback, verification commands, and merge/push status.
