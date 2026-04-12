# Event Room Recommendation Encounter Echo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Carry high-confidence event-room recommendation reasons into routed room-3 entry / clear feedback when that reason still cleanly explains why the chosen encounter profile fits the current run.

**Architecture:** Extend the shared encounter-routing layer with a narrow recommendation-echo helper and a small `命途圣坛` intent-tag expansion. Keep `shared/game-core.js` responsible for route/echo selection, and keep `game.js` limited to consuming the shared entry / clear strings during runtime feedback.

**Tech Stack:** Plain JavaScript, Phaser 3 scene glue, deterministic shared helpers in `shared/game-core.js`, regex/assert-based CLI regression checks.

---

### Task 1: Lock backlog and design state

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-event-room-recommendation-encounter-echo-design.md`
- Create: `docs/plans/2026-04-13-event-room-recommendation-encounter-echo-plan.md`

**Step 1: Update the active TODO**

Record `事件房推荐理由遭遇兑现回响` as the heartbeat target and move the broader encounter-routing expansion to `Next Up`.

**Step 2: Save design + plan docs**

Capture the shared-helper approach, the intentionally narrow echo mappings, and the `命途圣坛` routing expansion that makes the feature meaningful.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Add tests that prove:

- `命途圣坛` choices now map into `下间高压 / 下间缓冲`
- room-3 entry / clear helpers append short recommendation echoes only for the strong supported pairings
- unsupported or missing recommendations keep the old plain route copy

**Step 2: Add runtime source assertions**

Extend the source checks so they fail until `game.js` routes the resolved event room into the shared entry / clear helper calls.

**Step 3: Run the regression script to confirm RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new encounter-echo assertions.

### Task 3: Implement the shared encounter echo

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add minimal intent-tag expansion**

Teach `getRunEventRoomChoiceIntentTags(...)` to classify `命途圣坛` low-HP burst and high-HP guard routes into the existing encounter profile language.

**Step 2: Add the shared encounter-echo helper**

Translate only the approved route+reason pairings into compact entry / clear suffixes and have the entry / clear builders append them after the existing tactical cue.

**Step 3: Run the regression script**

Run: `node scripts/regression-checks.mjs`
Expected: shared-helper assertions move green, with any remaining failures limited to runtime/doc checks.

### Task 4: Wire runtime and docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Update runtime hooks**

Pass the resolved event room into the shared entry / clear builders so floating text uses the same deterministic encounter-echo contract.

**Step 2: Update README/help-facing copy**

Document that some high-confidence recommendation reasons now continue into room-3 entry / clear feedback, including `命途圣坛` threshold routes.

**Step 3: Re-run regression script**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS.

**Step 2: Attempt delivery via fallback if needed**

- Try the required live-workspace `main` update / feature-branch creation first.
- If the existing dirty-worktree and ref-lock blockers still prevent local delivery, mirror the verified live workspace into a temp clone branch `feat/auto-event-room-recommendation-encounter-echo`, commit there, fast-forward merge into temp-clone `main`, and attempt pushes if the environment allows.
- Keep the feature branch intact.

**Step 3: Append the audit line**

Record task, requested/actual branch, exact checks command, pass/fail result, merge status, push status, and explicit blocker/fallback details.
