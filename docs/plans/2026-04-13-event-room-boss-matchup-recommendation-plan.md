# Event Room Boss Matchup Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the shared event-room recommendation helper use the current target Boss posture as a high-confidence tiebreaker, then preserve that reason into routed encounter feedback.

**Architecture:** Add a compact boss-posture weighting layer in `shared/game-core.js`, thread `bossKey` into the existing LevelScene preview state in `game.js`, lock the new recommendation and echo contracts in `scripts/regression-checks.mjs`, and sync the heartbeat docs/README wording.

**Tech Stack:** Vanilla JavaScript, Phaser 3 scene glue, shared game-core helpers, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-event-room-boss-matchup-recommendation-design.md`
- Create: `docs/plans/2026-04-13-event-room-boss-matchup-recommendation-plan.md`

**Step 1: Promote the new active item**

Add one `Active` TODO focused on boss-aware event-room recommendations and keep the follow-up narrow.

**Step 2: Save the design and plan docs**

Document the narrow boss-aware weighting approach and the TDD-first execution path.

### Task 2: Write the failing regression slice

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Add focused assertions showing that:

- `复苏祷言` can earn `目标Boss更宜回体`
- `游步修习` can earn `目标Boss更宜稳拍`
- `离弦修习` can earn `目标Boss更宜追后`

when no stronger existing recommendation already applies.

**Step 2: Add persistence and echo assertions**

Add one resolution assertion proving the recommended reason persists into `selectedChoiceRecommendationReason`, plus one routed encounter echo assertion proving the same reason still resolves to a readable follow-up cue.

**Step 3: Add runtime hook assertion**

Lock that `LevelScene._buildRunEventChoicePreviewState()` now passes `bossKey` into the shared recommendation helper state.

**Step 4: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because boss-aware recommendation reasons and/or the runtime `bossKey` hook do not exist yet.

### Task 3: Implement the shared boss-aware weighting

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add compact boss-posture weighting**

Teach `getRunEventRoomChoiceRecommendationDecision()` to read `bossKey` and return a small set of boss-aware reasons only when stronger live-state reasons are absent.

**Step 2: Preserve the boss-aware reason after selection**

Keep using the existing persisted recommendation path so the chosen event room stores the new reason automatically.

**Step 3: Extend routed encounter echo mappings**

Map the new boss-aware reasons to existing compact payoff echoes where appropriate.

**Step 4: Thread `bossKey` into preview state**

Update `LevelScene._buildRunEventChoicePreviewState()` to include the current boss key in the shared recommendation state.

**Step 5: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync docs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update README**

Document that event-room recommendations can now consider the current target Boss posture in a few high-confidence cases.

**Step 2: Mark the item complete**

Move the new TODO item to `Completed` with timestamp and leave the broader follow-up in `Next Up`.

### Task 5: Verify and deliver the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Attempt the required repo flow**

Use the temp fallback branch `feat/auto-event-room-boss-matchup-recommendation`, commit only after verification, merge into `main`, attempt to push `main`, keep the feature branch, and record blockers/fallbacks precisely in `PROGRESS.log`.
