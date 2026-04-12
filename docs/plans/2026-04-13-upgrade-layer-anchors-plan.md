# Upgrade Layer Anchors Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve cumulative-vs-next layer meaning longer in narrow blacksmith upgrade rows by adding a compact dual-layer fallback before the summary collapses to one layer.

**Architecture:** Extend `buildWeaponUpgradePreviewSummary` with an intermediate compact variant derived from the existing cumulative/next benefit segments, then lock the behavior in the regression script and sync README/help/TODO so the contract stays documented across surfaces.

**Tech Stack:** Vanilla JavaScript, shared game-core helpers, Phaser 3 scene help copy, Node regression script

---

### Task 1: Lock the new fallback ladder in regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add coverage proving that a non-max upgrade row returns `长剑 Lv.2 · 累计+4 / 下次+5` at an intermediate width before it falls back to unlabeled or single-layer summaries.

**Step 2: Run the required check to verify RED**

Run:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the intermediate compact layer-anchor fallback does not exist yet.

### Task 2: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add the compact dual-layer variant**

Inside `buildWeaponUpgradePreviewSummary`, derive compact value-pairs from the first cumulative and next benefit segments and insert them into the existing layered fallback order after the full `累计+下次` variant.

**Step 2: Keep existing contracts stable**

Do not change max-level summaries, affordability labels, or the final unlabeled/single-layer fallbacks beyond what is needed for the new intermediate step.

### Task 3: Sync surfaced docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`

**Step 1: Update README and help overlay**

Document that narrow non-max upgrade rows now compact to `累计+4 / 下次+5` before they give up one of the two payoff layers.

**Step 2: Re-prioritize TODO**

Mark `铁匠强化累计/下次压缩语义` complete, promote the material-anchor follow-up, and add one new repo-grounded next-step item.

### Task 4: Verify and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 2: Append the audit line**

Record the chosen task, branch attempt, check results, merge/push status, and the branch-switch blocker caused by `.git/index.lock`.
