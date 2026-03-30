# Action HUD Ready Flash Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a brief highlight to the combat action HUD when an action becomes ready, especially right after dodge lockout ends, so the player can spot the recovery boundary immediately.

**Architecture:** Keep `buildCombatActionHudSummary` for text output, then add a sibling helper in `shared/game-core.js` that returns boolean ready states for `attack`, `special`, and `dodge`. In `game.js`, track the previous ready-state snapshot and drive a short flash window on `this.actionText` when any action flips from blocked to ready. Cover the shared readiness logic and the scene hook with regression checks, then sync README/TODO/PROGRESS.

**Tech Stack:** JavaScript, Node.js, Phaser 3

---

### Task 1: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add shared-helper assertions for a new readiness metadata helper, including:

- post-roll-ready case where `attack` is immediately ready after dodge lockout
- mixed case where cooldown/stamina still block `special` and `dodge`

Also add a source-hook assertion that `game.js` stores previous action readiness and applies a timed highlight to `this.actionText` when a newly ready action is detected.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the readiness helper and highlight hook do not exist yet.

### Task 2: Implement the highlight

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Export a shared helper that resolves `attack` / `special` / `dodge` readiness from the same inputs used by the summary helper
- In `UIScene`, keep a previous readiness snapshot plus a short flash expiry timestamp
- When any action flips to ready, brighten `this.actionText` briefly, then fall back to the normal muted color

**Step 2: Run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new readiness-flash assertions and existing action HUD coverage.

### Task 3: Sync docs and heartbeat log

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the short readiness flash in README and close the active TODO, then add one focused next-active follow-up item.

**Step 2: Close the heartbeat cycle**

Append the mandatory audit line with branch, verification command, merge fallback, and files changed.
