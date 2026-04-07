# Risk/Reward Shrine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new threshold-based event room that lets a run pivot into low-HP burst or high-HP mitigation, with readable HUD labels and runtime payoff cues.

**Architecture:** Extend `shared/game-core.js` with the new run-effect keys and `命途圣坛` definition, then thread those effects through `game.js` damage/HUD helpers. Lock the contract in `scripts/regression-checks.mjs` before implementation and sync player-facing docs after runtime behavior is in place.

**Tech Stack:** Vanilla JavaScript, Phaser 3, shared game-core helpers, repo regression script

---

### Task 1: Define the shrine contract

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression coverage for:
- default neutral threshold run-effect values
- `命途圣坛` route keys and summaries
- resolved run effects for `绝境修习` and `守心修习`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing `命途圣坛` definitions / threshold keys.

**Step 3: Write minimal implementation**

Add the new default run-effect keys, additive handling for threshold ratios, and the new event-room entry with explicit `routeSummary` and `resolutionText`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: the new shrine contract assertions pass.

### Task 2: Wire runtime damage and HUD state

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression checks that require:
- low-HP damage logic inside player outgoing damage calculation
- high-HP mitigation logic inside player incoming damage calculation
- attack/dodge HUD labels exposing inactive vs active threshold states
- hit/taken-damage payoff cues firing only when the threshold route is actually active

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing threshold HUD/runtime hooks.

**Step 3: Write minimal implementation**

Add threshold helper methods, apply the new multipliers in combat, mark low-HP empowered hitboxes, and emit the new `绝境` / `守心` cues when triggered.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: the new runtime assertions pass without regressing existing shrine hooks.

### Task 3: Sync docs and heartbeat audit

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new shrine, HUD labels, and payoff cues in the README and mark the TODO item as completed with the next active follow-up.

**Step 2: Verify docs stay aligned**

Run: `node scripts/regression-checks.mjs`
Expected: existing README contract checks still pass.

**Step 3: Commit**

Run:
```bash
git add shared/game-core.js game.js scripts/regression-checks.mjs README.md TODO.md PROGRESS.log docs/plans/2026-04-06-risk-reward-shrine-design.md docs/plans/2026-04-06-risk-reward-shrine-plan.md
git commit -m "feat: add risk reward shrine"
```
