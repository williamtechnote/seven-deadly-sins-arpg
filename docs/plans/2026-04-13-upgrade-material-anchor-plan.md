# Upgrade Material Anchor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let wide blacksmith upgrade success receipts show both the gained payoff and the spent material without weakening the existing narrow-width fallback ladder.

**Architecture:** Extend the shared upgrade-success helper with a payoff-plus-material variant ordered ahead of the existing payoff-only variants, then lock the behavior in regression coverage and sync README/help/TODO/PROGRESS.

**Tech Stack:** Vanilla JavaScript, shared game-core helpers, Phaser 3 help overlay copy, Node regression script

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add coverage proving that a wide success receipt returns `强化成功! Lv.1→Lv.2 · 本次伤害+4 / 特攻-0.2s / 体耗-2 · 消耗2暴怒之精华` before the helper falls back to the existing payoff-only variants.

**Step 2: Run the required command to verify RED**

Run:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the wider payoff-plus-material success variant does not exist yet.

### Task 2: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Insert the wider payoff-plus-material variant**

Inside `buildWeaponUpgradeSuccessMessage`, derive the material anchor from the existing spent-count/material-name data and add it after the level/payoff anchor on the widest variant.

**Step 2: Preserve the narrow fallback ladder**

Keep the existing payoff-only, level-only, and spend-only variants in the same general order so current narrow-width contracts stay stable.

### Task 3: Sync surfaced docs and roadmap

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Update README and help overlay**

Document that wide success receipts now include `消耗2暴怒之精华` after the payoff anchor, while narrow widths still keep the level/payoff anchor ahead of cost detail.

**Step 2: Re-prioritize TODO**

Mark `铁匠强化成功回执材料锚点` complete, promote `铁匠强化成功回执累计总览` if it remains the next active blacksmith item, and add one new repo-grounded follow-up TODO that broadens the roadmap beyond the current blacksmith lane.

### Task 4: Verify and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 2: Append the audit line**

Record the chosen task, branch attempt, checks, merge/push status, and any git blocker or fallback that still prevents non-`main` delivery.
