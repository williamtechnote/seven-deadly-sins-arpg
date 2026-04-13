# Encounter Entry Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make resolved shrine encounter routes readable on room-3 entry by announcing a shared tactical subtitle alongside `缓冲战 / 高压战 / 淘金战`.

**Architecture:** Add a shared helper in `shared/game-core.js` that maps the existing encounter profile to a concise entry cue, then have `LevelScene` consume that helper from `_maybeAnnounceRunEventEncounterProfile()`. Lock the change with regression assertions first, then sync README/help copy and the heartbeat audit.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock backlog and planning state

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-encounter-entry-preview-design.md`
- Create: `docs/plans/2026-04-13-encounter-entry-preview-plan.md`

**Step 1: Reprioritize the heartbeat TODO**

Promote `第三房路线开场预告` to `Active` and move the blacksmith cumulative receipt follow-up to `Next Up`.

**Step 2: Save the design and plan docs**

Record the rejected alternatives, chosen direction, and TDD-first execution path.

### Task 2: Write failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new shared helper that proves:

- `breather` resolves to `缓冲战 · 双拍缓冲`
- `pressure` resolves to `高压战 · 三向成压`
- `windfall` resolves to `淘金战 · 后排赏金`
- unknown or missing profiles stay silent

**Step 2: Add runtime-hook assertions**

Extend the source check for `_maybeAnnounceRunEventEncounterProfile()` so it fails until the runtime consumes the shared helper result instead of only rendering `profile.encounterLabel`.

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the helper export and runtime usage do not exist yet.

### Task 3: Implement the entry-cue contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a helper that builds the route-colored room-entry label from the resolved encounter profile.

**Step 2: Use the helper at room entry**

Update `_maybeAnnounceRunEventEncounterProfile()` to read the shared helper, keep the one-shot guard, and announce the composed label when the player crosses into room 3.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that the routed third-room identity is now visible immediately on room entry through a short `缓冲战 / 高压战 / 淘金战` tactical cue.

**Step 2: Update help overlay copy**

Extend the existing event-room help text so it mentions the new room-entry cue without creating a second divergent description.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt git integration and append audit**

Attempt the required feature-branch workflow, then record task, requested branch, actual branch state, checks, merge status, push status, blocker, and fallback in `PROGRESS.log`.
