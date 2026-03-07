# Event Room Supply And Prayer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship two new event-room prototypes, `战备商柜` and `祈愿圣坛`, with regression coverage, README updates, and heartbeat audit logging.

**Architecture:** Add the new TODO ordering first, then extend `scripts/regression-checks.mjs` with failing checks. Implement the minimal shared settlement changes in `shared/game-core.js`, keeping `game.js` focused on applying inventory/runtime deltas and showing the existing settlement feedback. Reuse `runEffectBuff` for prayer buffs and add one narrow new effect type for gold-to-item trades.

**Tech Stack:** Phaser 3, vanilla JavaScript, Node CLI regression checks

---

### Task 1: Re-prioritize the heartbeat queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-event-room-supply-prayer-design.md`
- Create: `docs/plans/2026-03-07-event-room-supply-prayer.md`

**Step 1: Promote three new event-room follow-ups into `Active`**

**Step 2: Save the short design doc with the branch-creation fallback assumption**

**Step 3: Save the implementation plan**

### Task 2: Add failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add assertions for `supplyCache` choice keys and settlement results**

**Step 2: Add an insufficient-gold assertion for the supply event**

**Step 3: Add assertions for `prayerShrine` choice keys, persisted choice metadata, and run-effect multipliers**

**Step 4: Run `node scripts/regression-checks.mjs` and verify failure**

### Task 3: Implement shared event-room logic

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Extend `RUN_EVENT_ROOM_POOL` with `supplyCache` and `prayerShrine`**

**Step 2: Add minimal settlement support for a gold-for-items effect**

**Step 3: Ensure prayer choices flow through existing `runEffectBuff` handling**

**Step 4: Re-run `node scripts/regression-checks.mjs` and verify the new checks pass**

### Task 4: Apply runtime and documentation updates

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Apply any inventory deltas from the new supply event at runtime**

**Step 2: Extend settlement floating text for item rewards when relevant**

**Step 3: Mark the first two TODO items complete and leave the HUD summary follow-up active**

**Step 4: Update README event-room and regression-check sections**

### Task 5: Verify and record the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 2: If verification passes, attempt commit, merge to `main`, and push `main`; if local branch creation remains blocked, try preserving `feat/auto-event-room-supply-prayer` remotely**

**Step 3: Append the mandatory audit line with exact test, merge, push, and branch-fallback status**
