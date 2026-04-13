# Resource-Route Recommendation Encounter Echo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let resource/settlement recommendation reasons that are already high-confidence (`当前局已偏节奏`, `当前可负担`) survive into routed room-3 entry / clear / source cues instead of stopping at panel notes or baseline anchors.

**Architecture:** Extend the shared event-room recommendation helper so `tempoPrayer` can persist a real `当前局已偏节奏` recommendation, then add explicit encounter-feedback mappings for that reason and for `fieldTonic + 当前可负担`. Keep `game.js` on the existing shared-helper contract and only sync docs after the shared logic is green.

**Tech Stack:** Plain JavaScript shared helpers, Phaser help overlay copy, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-resource-route-recommendation-encounter-echo-design.md`
- Create: `docs/plans/2026-04-13-resource-route-recommendation-encounter-echo-plan.md`

**Step 1: Reprioritize TODO**

- replace the older encounter-preview active item with this concrete resource-route why-now gap
- keep the encounter-preview copy pass queued in `Next Up`

**Step 2: Save design + plan docs**

- lock the two approved route/reason/profile pairings
- lock the shared recommendation-first fallback order

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Cover:

- `buildRunEventRoomChoiceRecommendation(...)` recommending `迅击祷言 · 当前局已偏节奏` when run modifiers already bias the run toward `节奏`
- routed `tempoPrayer` entry / clear / source cues upgrading to `顺势抢压`
- routed `fieldTonic` entry / clear / source cues upgrading to `趁价备净` when the persisted recommendation reason is `当前可负担`

**Step 2: Add doc assertions**

Extend README/help regex checks so they fail until the new tempo-bias and affordability encounter echoes are documented.

**Step 3: Verify RED**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: FAIL on the new recommendation / encounter-echo assertions.

### Task 3: Implement the shared logic

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Promote the tempo-bias recommendation**

- detect `节奏` run-modifier bias in the shared recommendation helper for the `renewalPrayer / tempoPrayer` pair
- persist `当前局已偏节奏` as the recommendation reason only when the signal is strong

**Step 2: Extend encounter feedback mappings**

- `tempoPrayer + 当前局已偏节奏 + pressure => 顺势抢压`
- `fieldTonic + 当前可负担 + breather => 趁价备净`

**Step 3: Verify GREEN**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: PASS for the new helper assertions.

### Task 4: Sync docs and finish the heartbeat

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `PROGRESS.log`

**Step 1: Update README/help overlay**

Document that:

- `迅击祷言` can now turn `当前局已偏节奏` into routed `顺势抢压`
- `战地净化包` can now turn `当前可负担` into routed `趁价备净`

**Step 2: Run the exact required verification**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 3: Deliver and audit**

- commit on `feat/auto-resource-route-recommendation-echo`
- merge to `main`
- push `main` while keeping the feature branch
- append the mandatory audit line with branch blocker/fallback details
