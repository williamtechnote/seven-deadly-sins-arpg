# Event Room Prompt Type Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the event-room shrine proximity hint show compact room-type tags that match the rest of the event-room UX.

**Architecture:** Add a pure helper in `shared/game-core.js` that formats the approach prompt from normalized event-room data, cover it in `scripts/regression-checks.mjs`, and have `game.js` read that helper instead of the current hard-coded prompt string. Unknown/future room types keep the generic fallback to avoid brittle copy.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node-based regression script

---

### Task 1: Prompt-label helper regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression coverage asserting that trade, healing, and blessing/risk-buff rooms map to `按F交易` / `按F治疗` / `按F效果`, and that unknown room types fall back to `按F抉择`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the prompt-label helper is not exported yet.

**Step 3: Write minimal implementation**

Add and export a shared helper that formats the prompt from the room type using the existing room-type prefix rules.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper coverage.

### Task 2: Scene wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Wire the prompt**

Replace the fixed `按F抉择` shrine indicator text with the shared helper so the visible prompt tracks the known room type while the player is in range.

**Step 2: Preserve fallback behavior**

Keep resolved rooms hidden as before, and keep unknown/future room types on `按F抉择`.

**Step 3: Sync docs**

Update `README.md` and `TODO.md` so the event-room docs mention the proximity prompt type tags and the fallback rule.

### Task 3: Delivery and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt git delivery**

Create/preserve the requested `feat/auto-event-room-prompt-type-labels` branch if possible, otherwise record the local ref-lock blocker and preserve the branch name by pushing `HEAD` to that remote ref after merge.

**Step 3: Append audit**

Record the exact task, branch outcome, verification result, merge status, and push status in `PROGRESS.log`.
