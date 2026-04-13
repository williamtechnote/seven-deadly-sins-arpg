# Portal Choice Summary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared Hub portal-focus summary card that combines next-target framing with the persisted last-run recap.

**Architecture:** Extend `shared/game-core.js` with a boss-target normalization helper and a new `buildHubPortalChoiceSummary` formatter, then wire HubScene to detect the nearest in-range portal and render a compact `选门参考` panel from that shared output. Lock the contract with regression tests before implementation.

**Tech Stack:** Phaser 3 scene UI, shared JavaScript helpers, Node regex/assert regression checks.

---

### Task 1: Capture the shared portal-summary contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add helper assertions for:
- full target + recap + source output
- target + previous boss fallback when route recap is absent
- target-only visibility
- hidden state when no portal target exists

Add HubScene regex assertions for:
- shared helper import
- dedicated panel creation
- nearest-portal focus selection
- shared helper-driven text refresh

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing helper export/runtime wiring assertions.

**Step 3: Write minimal implementation**

Implement the new shared helper and HubScene panel/focus refresh code only as far as needed to satisfy the contract.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper/runtime assertions.

### Task 2: Implement shared helper and HubScene focus panel

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write the failing test**

Use the new assertions from Task 1 as the failing red state.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL until both the shared helper and HubScene wiring exist.

**Step 3: Write minimal implementation**

- Add per-boss posture cue mapping in `shared/game-core.js`
- Add `normalizeHubPortalTarget`
- Add `buildHubPortalChoiceSummary`
- Export the helper
- Import it in `game.js`
- Create a fixed HubScene portal-focus panel
- Refresh it each frame from the nearest in-range portal and `GameState.lastRunSummary`

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for helper logic and runtime hook coverage.

### Task 3: Sync docs and verification

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Write the failing test**

Add README/help-overlay regression expectations for the new `选门参考` copy if needed.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL until README text matches the new contract.

**Step 3: Write minimal implementation**

Document the new Hub portal-focus behavior in README without bloating the intro.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
