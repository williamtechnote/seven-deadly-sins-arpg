# Boss-Door Run-Arc Recap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend routed room-3 identity into the Boss-door handoff with a short shared run-arc recap under the existing boss label.

**Architecture:** Add a shared Boss-door recap helper in `shared/game-core.js`, then let `LevelScene` compose the Boss-door label from the existing boss name plus that helper once room 3 is cleared. Lock the behavior with regression coverage first, then sync README/help copy and the heartbeat audit.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock backlog and docs

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-run-arc-recap-contract.md`
- Create: `docs/plans/2026-04-13-boss-door-run-arc-recap-design.md`
- Create: `docs/plans/2026-04-13-boss-door-run-arc-recap-plan.md`

**Step 1: Promote the new heartbeat item**

Move the Boss-door run-arc recap idea into `## Active` and leave one follow-up in `## Next Up`.

**Step 2: Save the new methodology/design/plan docs**

Capture the shared-helper approach, rejected alternatives, and why the Boss-door surface is the correct next beat.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing checks proving:

- `breather` resolves to `缓冲路线 · 稳线迎战`
- `pressure` resolves to `高压路线 · 顶压迎战`
- `windfall` resolves to `淘金路线 · 带赏迎战`
- unknown / missing profiles stay silent

**Step 2: Add runtime-hook assertions**

Extend source checks so they fail until `LevelScene`:

- exports/uses the shared Boss-door recap helper
- keeps `Boss: <name>` as the base label
- appends the shared recap only after room 3 is fully cleared

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL on the new Boss-door helper/runtime assertions.

### Task 3: Implement the Boss-door recap contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a deterministic helper that converts the routed encounter profile into the Boss-door segment recap.

**Step 2: Apply it to the Boss-door label**

Keep the base boss label intact, and append the shared route recap only after room 3 is cleared.

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that the Boss door now keeps a short route recap after the room-clear floating text.

**Step 2: Update help overlay copy**

Extend the routed-encounter explanation so the Boss-door handoff is described in the same contract.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required command exactly**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Attempt git delivery and append the audit line**

Record the dirty-worktree / ref-lock blockers if they still apply, use a temp-clone fallback if needed, and keep the feature branch intact.
