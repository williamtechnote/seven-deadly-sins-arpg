# First Shrine Choice Target Footer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the current boss posture alive inside the first shrine choice panel when no stronger recommendation is available.

**Architecture:** Add one shared helper in `shared/game-core.js` that resolves the event-room choice-panel footer message. It should prefer the existing recommendation helper, then fall back to a compact boss-target footer, and finally let runtime keep the generic instruction footer. Update `game.js`, README/help text, and regression coverage to consume the same contract.

**Tech Stack:** Vanilla JavaScript, Phaser 3 UI, Node regression checks

---

### Task 1: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Assert the new shared footer helper is exported.
- Assert it returns `当前目标：稳拍反制` for a first-shrine no-recommendation Lust state.
- Assert it still returns an existing high-confidence recommendation when one exists.
- Assert runtime wiring uses the helper before falling back to `RUN_EVENT_CHOICE_PANEL_FOOTER_DEFAULT`.
- Assert README/help text document the neutral target footer.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared footer helper and runtime/docs wiring do not exist yet.

### Task 2: Implement the shared footer contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write minimal implementation**

- Add a shared helper that prefers recommendation text, then boss-target footer text, then empty string.
- Reuse the existing boss posture vocabulary rather than adding a new mapping.
- Update the shrine choice panel to use the shared footer helper.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and heartbeat records

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Modify: `docs/methodology/arpg-choice-panel-target-footer.md`

**Step 1: Update docs**

- Document the neutral target footer in README and help overlay.
- Mark the completed TODO item and seed one follow-up evaluation item.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
