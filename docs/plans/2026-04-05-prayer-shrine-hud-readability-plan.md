# 祈愿圣坛 HUD 可读性 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose `祈愿圣坛` route identity directly in the action HUD so `复苏祷言 / 迅击祷言` stay readable throughout combat.

**Architecture:** Reuse the existing action-HUD prefix path instead of adding another shrine UI. Extend the existing player HUD-label helpers in `game.js` to derive compact prayer tags from the already-applied run effects, and lock the behavior with regression assertions in `scripts/regression-checks.mjs`.

**Tech Stack:** Phaser 3, plain JavaScript, shared HUD helpers, Node regression script

---

### Task 1: Lock the prayer HUD contract with failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression assertions for:

- `特攻 O` surfacing `迅击-22%`
- `闪避 Space` surfacing `复苏+35%`
- prayer labels staying visible during dodge-lock preview
- runtime source hooks reading `playerSpecialCooldownMultiplier` / `playerStaminaRegenMultiplier`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new prayer-shrine HUD assertions

### Task 2: Implement the minimal runtime label support

**Files:**
- Modify: `game.js`

**Step 1: Derive compact prayer labels**

- `getCombatSpecialStatusLabel(now)` falls back to `迅击-22%` when the prayer cooldown route is active and no temporary shrine window is overriding the row
- `getCombatDodgeStatusLabel()` falls back to `复苏+35%` when the prayer stamina-regen route is active and no dodge-economy shrine label is overriding the row

**Step 2: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Update docs, TODO priority, and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document the new prayer-shrine HUD labels, mark the TODO item complete, and promote the next priority.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-prayer-shrine-hud-labels`.
