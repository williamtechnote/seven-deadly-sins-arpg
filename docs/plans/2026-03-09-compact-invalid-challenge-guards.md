# Compact Invalid Challenge Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the compact invalid-target `未知挑战` fallback contract into tests and docs for both in-progress and completed run challenges.

**Architecture:** Reuse the existing compact sidebar helper behavior in `shared/game-core.js` and add narrow regression coverage around the exhausted-label + invalid-target combinations. Update the README and help overlay copy so the documented contract matches the existing runtime behavior.

**Tech Stack:** JavaScript, Phaser 3, Node-based regression checks

---

### Task 1: Capture failing docs/behavior checks for compact in-progress invalid targets

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add one helper assertion for compact in-progress invalid-target summaries with an exhausted upstream label, plus README/help-overlay regex assertions for the new contract text.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing README/help-overlay mention for the compact invalid-target `未知挑战` fallback.

**Step 3: Write minimal implementation**

Update docs/help text to describe `本局挑战：进行中` plus `未知挑战 · +90金` / `未知挑战`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new in-progress guard.

### Task 2: Capture failing docs/behavior checks for compact completed invalid targets

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Add one helper assertion for compact completed invalid-target summaries with an exhausted upstream label, plus README/help-overlay regex assertions for the completed-state wording.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing README/help-overlay mention for the compact completed invalid-target `未知挑战` fallback.

**Step 3: Write minimal implementation**

Update README/help text to describe `本局挑战：已完成` plus `未知挑战 · +90金` / `未知挑战`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new completed guard.

### Task 3: Heartbeat verification and audit

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update the heartbeat queue**

Replace the placeholder active TODO with three concrete guard items, marking the first two done and leaving the ultra-compact follow-up active.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Record audit**

Append one timestamped audit line to `PROGRESS.log` with the intended branch name, test result, merge/push status, and the sandbox blocker if git writes remain denied.
