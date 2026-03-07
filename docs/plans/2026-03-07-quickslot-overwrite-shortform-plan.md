# Quick-Slot Overwrite Shortform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Shorten the full quick-slot overwrite toast without losing the slot number or replacement identity.

**Architecture:** Only the overwrite branch of `buildQuickSlotAutoAssignNotice` changes. The shared helper remains the single source of truth for runtime copy, then the README/help overlay and regression checks are aligned to the same shortform examples.

**Tech Stack:** Plain JavaScript, Phaser 3, Node.js regression script

---

### Task 1: Write failing regression expectations for overwrite shortform copy

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that expect:
- `快捷栏1：HP→ST` for different-label overwrites
- `快捷栏1：同类 HP` for same-label overwrites
- `快捷栏1：替换 HP` when only the replaced label is known
- matching README/help text examples

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared helper and docs still use the longer parenthetical copy.

### Task 2: Implement the minimal overwrite shortform

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

- Keep `已自动装入快捷栏 N` for non-overwrite placement.
- Return the new slot-led shortform only when `didOverwrite` is true.
- Update help/README wording to mirror the helper output.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the overwrite shortform expectations.

### Task 3: Update heartbeat tracking and run full verification

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update tracking**

- Split the remaining parent TODO into three sub-items.
- Mark the first two complete and leave the third active.
- Append the heartbeat audit line after verification.

**Step 2: Run full heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
