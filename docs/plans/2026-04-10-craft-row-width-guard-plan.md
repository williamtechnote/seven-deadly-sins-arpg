# Craft Row Width Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep blacksmith recipe rows readable inside the existing `[制作]` layout lane even after adding affordability and quick-slot-preview copy.

**Architecture:** Add one shared row-label formatter with a deterministic fallback ladder, then have `BlacksmithScene` pass actual Phaser text measurements and a fixed row-width budget into that helper. Lock the behavior with regression checks before changing the runtime, then sync README/TODO/PROGRESS.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the width-guard contract in regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing coverage for a new row-label helper that proves:

- `拥有` is dropped before `可做xN` / `入1`
- long material names compact before the pre-click status labels disappear
- the affordability cue survives longer than the quick-slot preview when width gets even tighter

**Step 2: Add runtime-hook assertions**

Require `BlacksmithScene` to call the shared helper with an actual Phaser-backed measurement callback and an explicit row-width budget.

**Step 3: Run the required verification command and confirm failure**

Run:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the row-label helper and BlacksmithScene measurement hook do not exist yet.

### Task 2: Implement the shared formatter and scene hook

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared row-label helper**

Build the recipe row from existing crafting affordance and quick-slot-preview helpers, then fit it against a caller-provided width budget with a deterministic fallback ladder.

**Step 2: Add BlacksmithScene measurement support**

Create a hidden Phaser text node for recipe-row measurement, compute the available width in front of `[制作]`, and route `_buildCraftLabel` through the shared helper with `measureTextWidth`.

**Step 3: Keep scope narrow**

Do not add a new panel, tooltip, or multi-line blacksmith layout in this heartbeat.

### Task 3: Sync docs and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README**

Document that narrow blacksmith recipe rows now collapse lower-priority copy before they crowd the craft button.

**Step 2: Re-prioritize TODO**

Mark `铁匠制作行宽度保护` complete and add exactly one repo-grounded follow-up TODO item.

**Step 3: Append the audit line**

Record the git-path attempt, required test command result, merge status, push status, blocker, and fallback.
