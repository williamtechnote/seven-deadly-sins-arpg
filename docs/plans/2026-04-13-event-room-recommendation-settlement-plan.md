# Event Room Recommendation Settlement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve a compact high-confidence event-room recommendation reason after selection so post-choice confirmation surfaces still explain why the chosen route fit the current run.

**Architecture:** Extend the shared event-room resolution payload with a persisted recommendation receipt derived from the same preview state used by the choice panel. Then thread that receipt through shared HUD/world-label builders and the runtime shrine settlement feedback without changing ambiguous or non-recommended paths.

**Tech Stack:** Plain JavaScript, Phaser 3 scene glue in `game.js`, deterministic shared helpers in `shared/game-core.js`, regex/assert-based CLI regression checks.

---

### Task 1: Lock the desired post-choice contract with failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that:

- `resolveRunEventRoomChoice(...)` stores a compact recommendation receipt when the selected route matches the high-confidence recommendation.
- `buildRunEventRoomHudSummary(...)`, `buildRunEventRoomHudLines(...)`, and `buildRunEventRoomWorldLabel(...)` include that receipt for resolved known-room summaries.
- non-recommended/ambiguous routes keep the existing output.
- `game.js` runtime settlement feedback reads the persisted receipt.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new recommendation-settlement assertions.

### Task 2: Implement the shared persisted receipt

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

Add a small shared helper that converts `建议 2：净泉啜饮 · 可净化2层` into a selected-choice-scoped compact receipt, then store it on resolved event rooms and thread it through normalization/pick helpers.

**Step 2: Run test to verify targeted assertions move green**

Run: `node scripts/regression-checks.mjs`
Expected: the new shared-helper assertions pass, with any remaining failures limited to runtime/doc checks.

### Task 3: Wire the runtime settlement feedback and docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update runtime feedback**

Show the persisted compact receipt in shrine settlement floating text without displacing the chosen route label or the existing resource/encounter lines.

**Step 2: Update README/help-overlay-facing copy**

Document that high-confidence event-room recommendations can now persist into resolved HUD/world-label confirmation surfaces.

**Step 3: Re-run regression script**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS.

**Step 2: Attempt git delivery flow**

- In the live workspace, try `git pull --ff-only origin main` and `git switch -c feat/auto-event-room-recommendation-settlement`.
- If the known ref-lock/dirty-worktree blocker persists, mirror the verified workspace into the temp clone branch `feat/auto-event-room-recommendation-settlement`, commit there, fast-forward merge into temp-clone `main`, and attempt pushes if the environment allows.
- Keep the feature branch intact.

**Step 3: Append audit line**

Record task, requested/actual branch, exact checks command, pass/fail result, merge status, push status, and explicit blocker/fallback details.
