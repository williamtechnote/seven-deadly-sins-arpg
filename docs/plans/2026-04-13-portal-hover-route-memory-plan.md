# Portal Hover Route Memory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resurface the stored `上轮战报` at portal hover so the previous route remains visible at the moment of the next boss-door choice.

**Architecture:** Add a shared hub helper that composes a compact portal-hover recap from `lastRunSummary` and the hovered portal label, then wire HubScene to track nearest portal focus and show or hide a lightweight `选门回顾` panel. Update docs and regressions to lock the contract.

**Tech Stack:** Vanilla JS, Phaser 3, shared gameplay helpers, custom Node regression script

---

### Task 1: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Assert that a new portal-hover summary helper returns:

- `visible: true`
- `title: '选门回顾'`
- lines containing `目标 傲慢 · 傲慢王庭`, `上轮 淘金路线 · 带赏收官`, and `源于 豪赌 · 当前更宜稳押`

Also assert it returns `visible: false` when no last-run summary exists.

**Step 2: Add runtime hook expectation**

Assert that `HubScene.update()` tracks nearest portal focus and feeds the hovered portal label plus `GameState.lastRunSummary` into the shared helper before showing the portal-hover panel.

**Step 3: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper and hover panel do not exist yet.

### Task 2: Implement the shared helper and HubScene panel

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the helper**

Create a shared helper that builds the portal-hover recap from `lastRunSummary` and target label.

**Step 2: Add the HubScene UI**

- Create a hidden `选门回顾` panel in HubScene.
- Track portal focus inside `update()`.
- Show the panel only when a portal is focused and the helper returns `visible: true`.

**Step 3: Run regression to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper and wiring.

### Task 3: Update TODO and docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Move the TODO item through active to completed**

Document the portal-hover route-memory feature and leave one follow-up about whether a separate run-history view is still necessary.

**Step 2: Document the behavior**

Add a README/help note that portal hover now resurfaces the compact last-run recap at the next boss-door choice point.

**Step 3: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Integrate the branch

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Commit**

Run:

```bash
git add TODO.md README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/methodology/arpg-hub-portal-memory-handoff.md docs/plans/2026-04-13-portal-hover-route-memory-design.md docs/plans/2026-04-13-portal-hover-route-memory-plan.md
git commit -m "feat: add portal hover route memory"
```

**Step 2: Merge and push**

Run:

```bash
git switch main
git merge --ff-only feat/auto-portal-hover-route-memory
git push origin feat/auto-portal-hover-route-memory
git push origin main
```
