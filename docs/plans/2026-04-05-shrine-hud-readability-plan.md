# 战势圣坛 HUD 可读性 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `战势圣坛` route identity readable at a glance by pinning stamina-refund and dodge-burst state into the live action HUD.

**Architecture:** Extend the shared action-HUD formatter so attack and special rows can carry compact route-state labels, then feed those labels from the existing player combat/runtime state in `game.js`. Lock both summary output and runtime source hooks in the regression script so future heartbeat cycles cannot silently strip the shrine identity back out.

**Tech Stack:** Phaser 3, plain JavaScript, Node-based regression checks

---

### Task 1: Lock the desired HUD labels with failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression coverage for:

- `普攻 U` surfacing a persistent `回体+4` label when the stamina-refund route is owned
- `特攻 O` surfacing `借势待闪` when the dodge-burst route is owned but inactive
- `特攻 O` surfacing `借势1.6s` style remaining-window copy while the dodge-burst window is active
- HUD state assembly reading both labels from player/runtime methods

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new shrine-HUD assertions

**Step 3: Write minimal implementation**

Teach the shared HUD formatter to prepend attack/special status labels and update player/UI runtime methods to provide the persistent shrine-state copy.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Update docs and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new constant HUD route-state behavior and move the TODO item to completed with a concrete next priority.

**Step 2: Verify**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
