# Event Room Triggered Prefix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic resolved event-room HUD prefixes with room-type-specific labels for the first two prioritized archetypes.

**Architecture:** Keep the prefix decision in `shared/game-core.js` so both the Phaser HUD and the CLI regression checks read the same derived strings. Limit this cycle to `效果` and `交易`, leaving `治疗` as the next active TODO item.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node regression checks

---

### Task 1: Reprioritize the remaining TODO

**Files:**
- Modify: `TODO.md`

**Step 1: Replace the umbrella active item with three ordered prefix subtasks**

**Step 2: Make `效果` and `交易` the first two active items**

**Step 3: Leave `治疗` active for the next cycle**

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Change resolved blessing/risk-buff expectations from `已选:` to `效果:`**

**Step 2: Change resolved trade expectations from `已选:` to `交易:`**

**Step 3: Run `node scripts/regression-checks.mjs` and confirm the new expectations fail before implementation**

### Task 3: Implement shared prefix selection

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add a helper that maps resolved room types to the desired prefix**

**Step 2: Use that helper when building resolved route lines**

**Step 3: Keep healing on the current generic prefix until the next cycle**

### Task 4: Update docs and verify

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Document the new resolved `效果/交易` prefixes in README**

**Step 2: Mark the first two TODO items complete and leave the `治疗` item active**

**Step 3: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 4: Commit, publish `feat/auto-event-room-prefixes`, merge to `main`, push `main`, and append the audit line**
