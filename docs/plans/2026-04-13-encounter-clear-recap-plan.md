# Encounter Clear Recap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close the third-room route arc with a short shared recap cue when `缓冲战 / 高压战 / 淘金战` is fully cleared and the Boss door opens.

**Architecture:** Add a shared helper in `shared/game-core.js` that maps the existing encounter profile to a concise clear-recap label. Update `LevelScene` to announce that label exactly once when room 3 is first fully cleared, then sync README/help copy and lock the contract with regression checks.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock backlog and planning state

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-encounter-clear-recap-design.md`
- Create: `docs/plans/2026-04-13-encounter-clear-recap-plan.md`

**Step 1: Keep the route recap as the active heartbeat item**

Clarify that the cue should land at the room-3-clear / Boss-door-open moment, not as another generic route note.

**Step 2: Save the design and plan docs**

Capture rejected alternatives, the chosen helper-first approach, and the TDD/runtime/doc sync path.

### Task 2: Attempt the required git workflow before coding

**Files:**
- None

**Step 1: Refresh `main`**

Run `git fetch origin main` and `git pull --ff-only origin main`, recording any blocker caused by the pre-existing dirty workspace.

**Step 2: Create the requested feature branch**

Attempt `git switch -c feat/auto-encounter-clear-recap` and record the actual branch state if the sandboxed repo still refuses ref writes.

### Task 3: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new helper that proves:

- `breather` resolves to `缓冲战 · 稳住出清`
- `pressure` resolves to `高压战 · 顶住成压`
- `windfall` resolves to `淘金战 · 赏金到手`
- unknown or missing profiles stay silent

**Step 2: Add runtime-hook assertions**

Extend source checks so they fail until `LevelScene`:

- reads the shared clear-recap helper
- gates the cue to the first room-3 clear
- announces the recap when the Boss door becomes available

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the clear-recap helper/export and runtime usage do not exist yet.

### Task 4: Implement the clear-recap contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a deterministic helper that turns the resolved encounter profile into the room-clear recap label.

**Step 2: Consume the helper at room-3 clear**

Update `LevelScene` so the Boss-door-open transition also triggers the recap exactly once per encounter profile.

### Task 5: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that the routed third-room identity now also closes on clear with a short recap cue.

**Step 2: Update help overlay copy**

Extend the existing event-room / encounter wording so the clear-recap contract matches README.

### Task 6: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt git delivery and append the audit line**

If git writes are still blocked, record the explicit blocker and fallback; otherwise commit on the feature branch, merge to `main`, push `main`, and keep the feature branch.
