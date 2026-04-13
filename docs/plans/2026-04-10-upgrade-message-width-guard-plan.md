# Upgrade Message Width Guard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep blacksmith upgrade success/material-failure messages readable inside the existing bottom feedback lane when long essence names are involved.

**Architecture:** Add two shared upgrade-message helpers in `shared/game-core.js`, then have `BlacksmithScene` route upgrade success/material-failure through them using the existing Phaser-backed `craftMessage` text measurement path. Lock the helper outputs and scene hooks with regression coverage, then sync README/TODO/PROGRESS.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, shared game-core helpers, Node regression script

---

### Task 1: Lock the upgrade-message contract in regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing coverage that proves:

- upgrade material blockers keep the full essence name when width allows
- the helper compacts `暴怒之精华` to `暴怒` before it removes the spend/blocker count
- the helper still preserves `强化成功! 消耗2个` / `材料不足! 需要2个` before falling back to the bare conclusion

**Step 2: Add scene-hook assertions**

Require `BlacksmithScene` to pass `maxWidth` plus `measureTextWidth: text => this._measureBlacksmithTextWidth(text, 'craftMessage')` into the new shared helpers for upgrade success and material failure.

**Step 3: Run the required verification command and confirm failure**

Run:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the upgrade-message helpers and scene hooks do not exist yet.

### Task 2: Implement the shared helpers and scene usage

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper pair**

Build deterministic fallback variants for upgrade success/material failure from existing `canUpgradeWeapon` / `applyWeaponUpgrade` data.

**Step 2: Route BlacksmithScene through the helpers**

Replace the inline upgrade success/material-failure strings with the shared helpers while preserving the existing colors and message timing.

**Step 3: Keep scope narrow**

Do not add new UI, panels, or multi-line upgrade layouts in this heartbeat.

### Task 3: Sync docs and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update README/help copy**

Document that narrow upgrade feedback now compacts long essence names before it drops the spend/blocker count.

**Step 2: Re-prioritize TODO**

Mark `铁匠强化提示宽度保护` complete, promote the next upgrade readability item, and add exactly one new repo-grounded follow-up TODO item.

**Step 3: Append the audit line**

Record the git-path attempt, required test command result, merge status, push status, blocker, and fallback.
