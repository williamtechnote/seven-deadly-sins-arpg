# Event Room Choice Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make event-room choice failures explicit and make choice previews use the same compact copy style as the HUD.

**Architecture:** Add pure helper functions in `shared/game-core.js` for compact choice preview text and failed-choice feedback text, cover them in `scripts/regression-checks.mjs`, then wire `game.js` to use the helpers inside the event-room panel. Keep the third brainstormed TODO item deferred.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Shared compact choice preview helper

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression assertions that a healing choice preview becomes `净泉啜饮: 生命+30%, 净化` and a trade preview becomes `战地净化包: 金币-45, 净化药剂x1`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add and export a helper that composes `choice.label` with `describeRunEventChoiceRoute(choice)`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage.

### Task 2: Shared failed-choice feedback helper + scene wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add regression assertions that `insufficient_gold` maps to a clear blocker string and that unknown reasons fall back to a stable generic message.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add and export a feedback helper in `shared/game-core.js`. Update the event-room panel in `game.js` so failed settlements keep the panel open and rewrite the footer text/color with the helper output.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage and existing event-room checks.

### Task 3: Finish docs and verification

**Files:**
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Describe the compact choice preview copy and explicit blocker feedback in the event-room section.

**Step 2: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Attempt git delivery**

Run the required branch/commit/merge/push steps and record the actual outcome, including branch-lock blockers if they persist.
