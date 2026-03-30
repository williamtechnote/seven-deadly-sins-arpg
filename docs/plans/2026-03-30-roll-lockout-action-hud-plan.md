# Roll Lockout Action HUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the combat action HUD show `翻滚中` during dodge lockout so it no longer claims actions are ready while roll i-frames still block input.

**Architecture:** Extend the shared combat-action HUD helper in `shared/game-core.js` with one optional `isDodging` flag, then pass `player.isDodging` from `game.js`. Keep the existing cooldown/stamina copy intact for non-dodging states, and sync the behavior in regression checks plus player-facing docs.

**Tech Stack:** JavaScript, Node.js, Phaser 3

---

### Task 1: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a shared-helper assertion that `buildCombatActionHudSummary({ isDodging: true, ... })` returns:

```text
普攻 U: 翻滚中  特攻 O: 翻滚中  闪避 Space: 翻滚中
```

Also tighten the `game.js` source-hook regex so the helper call must include `isDodging: player.isDodging`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper currently ignores dodge lockout and `game.js` does not pass the flag.

### Task 2: Implement the HUD lockout label

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Return `翻滚中` for all three action labels when `isDodging` is true
- Pass `player.isDodging` into `buildCombatActionHudSummary(...)`

**Step 2: Run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new lockout assertions and all existing HUD cases.

### Task 3: Sync docs and heartbeat logs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that the action HUD now shows `翻滚中` during roll lockout in both README and the in-game help overlay copy.

**Step 2: Close the heartbeat cycle**

Mark the active TODO complete, promote a focused next-active HUD follow-up, and append the audit line with the git branch/merge fallback if local lock creation stays blocked.
