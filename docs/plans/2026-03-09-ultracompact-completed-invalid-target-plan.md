# Ultra-Compact Completed Invalid Target Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the ultra-compact completed invalid-target challenge summary onto the existing completion-first fallback ladder and sync the repo docs to that behavior.

**Architecture:** Reuse the existing shared ultra-compact completed summary helper in `shared/game-core.js`, add regression checks that prove the completed invalid-target path stays label-agnostic, then document the same rule in `README.md` and the in-game help overlay in `game.js`.

**Tech Stack:** JavaScript, Phaser 3, shared browser/CLI helpers, Node-based regression checks

---

### Task 1: Split the TODO and capture the design

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-ultracompact-completed-invalid-target-design.md`

**Step 1: Update the active TODO list**

Split the current combined active item into a regression task, a doc-sync task, and a final audit item.

**Step 2: Save the design note**

Record why regression coverage and doc alignment are sufficient without refactoring the helper.

### Task 2: Write the failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- the ultra-compact completed invalid-target visible summary staying on `挑战完成 · +90金 -> 挑战完成 -> 完成`
- the README wording for the invalid-target completed unknown-label ultra-compact path
- the matching in-game help overlay wording

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new README/help assertions because the wording is not present yet.

### Task 3: Sync docs/help copy

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Add the missing completed invalid-target ultra-compact wording without changing the existing ladder semantics.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new ultra-compact completed invalid-target assertions.

### Task 4: Verify and audit

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Close the first two TODO items and append the heartbeat audit line**

Record the intended feature branch plus the branch-creation fallback if the local ref lock persists.
