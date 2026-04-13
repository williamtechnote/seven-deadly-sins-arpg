# Boss Victory Route Recap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend routed shrine-route identity into the boss victory summary so the run segment closes after the boss kill instead of stopping at the room-3 clear recap.

**Architecture:** Add one shared helper in `shared/game-core.js`, consume it in `BossScene` with the existing routed encounter payload, and lock the behavior with regression checks plus README/docs updates.

**Tech Stack:** Phaser 3, plain JavaScript, shared CLI/browser game-core helpers, regex/assert-style regression checks.

---

### Task 1: Shared victory recap helper

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression assertions for:
- `breather -> 缓冲路线 · 稳线收束`
- `pressure -> 高压路线 · 顶压收束`
- `windfall -> 淘金路线 · 带赏收束`
- unknown/missing profiles stay silent

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the new helper/output does not exist yet.

**Step 3: Write minimal implementation**

Add `buildRunEventEncounterBossVictoryRecap(profile, runEventRoom, poolOverride)` beside the existing Boss-door/opener helpers and export it.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: the new helper assertions pass.

### Task 2: Wire BossScene victory summary

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add source assertions that:
- `BossScene.create` resolves the shared boss-victory recap from `data.runEventEncounterProfile`
- `_victorySequence()` appends that recap into `lines`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `BossScene` does not yet wire the helper.

**Step 3: Write minimal implementation**

Import the helper, pass the routed encounter profile from `LevelScene` into `BossScene`, store the resolved line on scene create, and append it into the victory summary only when present.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new scene assertions.

### Task 3: Update docs and verify full repo command

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `docs/methodology/arpg-boss-victory-closure-contract.md`
- Modify: `docs/plans/2026-04-13-boss-victory-route-recap-design.md`
- Modify: `PROGRESS.log`

**Step 1: Document the feature**

Add a concise README/help description for the new boss-victory closure beat and reprioritize TODO to show the new active item.

**Step 2: Run the required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

**Step 3: Commit**

Run:

```bash
git add TODO.md README.md PROGRESS.log docs/methodology/arpg-boss-victory-closure-contract.md docs/plans/2026-04-13-boss-victory-route-recap-design.md docs/plans/2026-04-13-boss-victory-route-recap-plan.md game.js shared/game-core.js scripts/regression-checks.mjs
git commit -m "feat: add boss victory route recap"
```
