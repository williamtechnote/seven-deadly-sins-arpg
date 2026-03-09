# Challenge Invalid Target Guards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent invalid in-progress run-challenge targets from surfacing misleading `0/0`-style fallback copy while preserving readable labels and completion copy.

**Architecture:** Add a small shared guard in the run-challenge helper layer so all sidebar/badge entry points consume the same sanitized progress semantics. Keep completed behavior unchanged and sync docs to the new invalid-target fallback rules.

**Tech Stack:** JavaScript, Phaser 3 UI helpers, Node-based regression checks

---

### Task 1: Refresh TODO and add failing regression coverage

**Files:**
- Modify: `TODO.md`
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression cases asserting:
- regular and compact in-progress summaries with `target: 0` do not emit `进度:0/0`
- ultra-compact in-progress summaries with `target: 0` use readable non-ratio fallback text
- hidden ultra-compact in-progress badges with `target: 0` stay silent

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new invalid-target challenge assertions

### Task 2: Implement the guard

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add a shared invalid-target guard for in-progress challenge progress derivation and reuse it from sidebar/badge helper entry points.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new invalid-target assertions

### Task 3: Sync documentation

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update docs/help copy**

Document that invalid in-progress challenge targets suppress misleading ratio copy, keeping readable in-progress text and silent hidden badges.

**Step 2: Run full required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
