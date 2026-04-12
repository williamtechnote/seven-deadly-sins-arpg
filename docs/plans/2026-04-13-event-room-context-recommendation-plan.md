# Event Room Context Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface a high-confidence contextual recommendation in the event-room choice panel footer when current run state clearly favors one option.

**Architecture:** Add a conservative shared recommendation helper in `shared/game-core.js` that compares the two visible choices against current state and returns either a short `建议 1/2：...` footer or silence. Keep `game.js` responsible only for passing the preview state into that helper and rendering the returned footer, then lock the new contract with regression assertions plus README/help/TODO/PROGRESS updates.

**Tech Stack:** Vanilla JavaScript, Phaser 3 event-room panel UI, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-event-room-context-recommendation-design.md`
- Create: `docs/plans/2026-04-13-event-room-context-recommendation-plan.md`

**Step 1: Reprioritize the backlog**

Promote `事件房抉择情境推荐` to `Active` and move the current blacksmith width follow-up to `Next Up`.

**Step 2: Save the design and plan docs**

Document the rejected reordering approach, the shared-footer recommendation approach, and the high-confidence-only rule.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Add failing assertions that expect a new shared helper to:

- recommend `净泉啜饮` when cleanse value is live
- recommend `绝境修习` when HP is already under its threshold
- stay silent when a pair is ambiguous

**Step 2: Add runtime/doc assertions**

Add source-hook coverage proving `_openRunEventChoicePanel()` routes the two choices plus preview state through the helper and sets the footer to the recommended message when present.

**Step 3: Run RED**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: FAIL because the helper/export/runtime footer wiring does not exist yet.

### Task 3: Implement the shared recommendation and panel wiring

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Implement a conservative scoring helper and export a public `buildRunEventRoomChoiceRecommendation(choices, state)` entrypoint.

**Step 2: Wire the footer**

In `_openRunEventChoicePanel()`, reuse the existing preview-state object, pass the two visible choices into the shared helper, and switch the footer from the default prompt to the recommendation only when a message is returned.

**Step 3: Keep neutral states neutral**

Ensure ambiguous states still use `按 1/2 选择，按 F 或 Esc 取消`.

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that the event-room panel can now elevate one choice into a `建议 1/2：...` footer when the current state clearly favors it, while preserving the original option order.

**Step 2: Update help overlay**

Mirror the same contract in the event-room help copy so the guidance is discoverable in-game.

### Task 5: Verify and audit the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 2: Attempt delivery and append the audit line**

Attempt the required git flow, then record the requested branch, actual branch state, checks, merge status, push status, blocker, and fallback in `PROGRESS.log`.
