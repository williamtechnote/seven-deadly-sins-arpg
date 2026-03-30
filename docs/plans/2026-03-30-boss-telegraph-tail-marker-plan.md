# Boss Telegraph Tail Marker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show a visible end-of-bar tail marker whenever a boss counter window outlasts the telegraph bar, so players do not misread the empty telegraph bar as the end of the counterable span.

**Architecture:** Reuse the shared boss telegraph summary builder to derive a single overflow flag from existing counter-window timing metadata. Keep BossScene responsible only for drawing the tail marker when that flag is present, then sync README / help copy and heartbeat backlog.

**Tech Stack:** JavaScript, Phaser 3 HUD rendering, shared `GameCore`, repo-local regression script

---

### Task 1: Lock the missing behavior with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Extend the boss telegraph helper assertions so an overflowing counter window must expose a visible tail-marker flag, and add a source assertion that BossScene draws a dedicated telegraph tail marker when that flag is present.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper and render path do not expose the tail marker yet.

### Task 2: Implement the shared timing state and BossScene marker

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

Pass `counterWindowStartOffsetMs` through `getTelegraphHudSummary`, compute whether the counter window extends beyond telegraph end, and draw a small high-contrast tail marker at the telegraph bar endpoint when that overflow flag is true.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new tail-marker assertions.

### Task 3: Sync backlog and player-facing docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Refresh TODO and copy**

Mark the tail-marker item complete, promote one follow-up readability idea to Active, and document the new overflow tail marker in the README and in-game help overlay.

**Step 2: Verify repo checks**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Audit and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Append audit line**

Record the heartbeat cycle with task, requested branch, tests, and merge fallback status.

**Step 2: Commit / merge / push**

Attempt the requested branch / commit / merge flow. If local git writes remain blocked, preserve the verified changes in the working tree and report the blocker explicitly.
