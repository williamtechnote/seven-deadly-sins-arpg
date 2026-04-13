# Threshold/Status Boss Posture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend boss-posture tie-breakers into `命途圣坛 / 烙痕圣坛` so threshold/status routes keep the same planning ladder already used by prayer, weapon-routing, and action-routing shrines.

**Architecture:** Add failing regression cases first, then extend the shared recommendation helper plus the routed encounter feedback mapper in `shared/game-core.js`. Sync README/help/TODO once the shared contract passes the exact required verification command.

**Tech Stack:** JavaScript, shared game-core helpers, Phaser 3 help overlay copy, Node regression script

---

### Task 1: Promote the heartbeat TODO and lock docs

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-threshold-status-boss-posture-tiebreaker.md`
- Create: `docs/plans/2026-04-13-threshold-status-boss-posture-design.md`
- Create: `docs/plans/2026-04-13-threshold-status-boss-posture-plan.md`

**Step 1: Promote the new TODO**

Move a new threshold/status boss-posture item into `## Active`.

**Step 2: Save the methodology/design/plan notes**

Capture the conservative tiebreaker rule and the routed-echo contract before implementation.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add recommendation RED cases**

Add failing tests for:

- `守心修习 · 目标Boss更宜回体`
- `绝境修习 · 目标Boss更宜压线`
- `余烬修习 · 目标Boss更宜控场`
- `血痕修习 · 目标Boss更宜压线`

**Step 2: Add routed echo RED cases**

Lock the same reasons into room-3 entry / clear / source cue helpers.

**Step 3: Run the required command and confirm RED**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the shared helper does not yet accept these boss-posture reasons for `命途 / 烙痕`.

### Task 3: Implement the shared helper changes

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Extend the recommendation helper**

Add the threshold/status boss-posture tiebreakers after stronger threshold/loadout/live-state checks.

**Step 2: Extend routed encounter feedback**

Map the new persisted reasons to the existing echoes:

- `守心稳场`
- `压线抢势`
- `灼烧稳场`
- `挂血抢势`

### Task 4: Sync surfaced docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Update README and help overlay**

Document that `命途 / 烙痕` now also reuse the boss-posture ladder in quiet high-confidence states.

**Step 2: Mark the TODO complete**

Move the active item into `## Completed` and add one grounded next-step follow-up.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Commit, merge, push attempt, and audit**

Record branch attempt, checks, merge status, push status, blocker, and fallback in `PROGRESS.log`.
