# Challenge Invalid-Target State Helper Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make visible invalid-target run-challenge summaries use explicit shared in-progress/completed state helpers for the no-reward path, with regression coverage and doc sync.

**Architecture:** Keep the existing sidebar formatter structure, but introduce tiny helper functions in `shared/game-core.js` that describe the visible invalid-target state ladders. Reuse them from the regular detail, compact title, and ultra-compact summary paths so the behavior no longer depends on scattered empty-progress branches.

**Tech Stack:** Plain JavaScript, shared UI formatting helpers in `shared/game-core.js`, lightweight Node regression checks in `scripts/regression-checks.mjs`

---

### Task 1: In-Progress Invalid-Target No-Reward Shared Helper

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression assertions that require a shared in-progress invalid-target visible helper and verify the existing `进行中` fallbacks still drive regular, compact, and ultra-compact summaries.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new in-progress invalid-target helper assertions.

**Step 3: Write minimal implementation**

Add the helper in `shared/game-core.js`, reuse it in the visible summary builders, and sync README/help-overlay wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Completed Invalid-Target No-Reward Shared Helper

**Files:**
- Modify: `shared/game-core.js`
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Write the failing test**

Add regression assertions that require a shared completed invalid-target visible helper and verify the existing `已完成` fallbacks still drive regular, compact, and ultra-compact summaries.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new completed invalid-target helper assertions.

**Step 3: Write minimal implementation**

Add the helper in `shared/game-core.js`, reuse it in the visible summary builders, and sync README/help-overlay wording.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS
