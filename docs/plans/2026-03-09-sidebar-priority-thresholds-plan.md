# Sidebar Priority Thresholds Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the first two concrete follow-ups for the remaining sidebar threshold/priority TODO: compact challenge copy on small viewports and overflow-based priority hiding for low-value sidebar blocks.

**Architecture:** Keep formatting and layout-selection rules in `shared/game-core.js` so they stay regression-testable, then let `UIScene` pass viewport state into those helpers and apply the resulting lines/visibility without redesigning the HUD.

**Tech Stack:** Plain JavaScript, Phaser 3 scene code, Node regression script

---

### Task 1: Split the broad sidebar TODO into concrete items

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-sidebar-priority-thresholds-design.md`
- Create: `docs/plans/2026-03-09-sidebar-priority-thresholds-plan.md`

**Step 1: Replace the single evaluation item**

- 窄视口下把本局挑战摘要压缩为两行紧凑版
- 侧栏超高时按优先级隐藏低优先级区块
- 继续评估未来更细的视口分档阈值 / 优先级策略

**Step 2: Keep only the third item active after implementation**

Run: `sed -n '1,12p' TODO.md`
Expected: the first two subtasks are marked complete in this heartbeat and the third remains active.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add pure helper coverage**

```js
assert.equal(typeof buildRunChallengeSidebarLines, 'function');
assert.deepEqual(
  buildRunChallengeSidebarLines(challenge, { compact: true }),
  ['本局挑战 12/30', '击败 30 个敌人']
);
```

```js
assert.equal(typeof buildPriorityTextStackLayout, 'function');
assert.deepEqual(result.hiddenKeys, ['event']);
```

**Step 2: Add source-hook checks**

- compact challenge formatting routes through a shared helper
- fixed sidebar layout routes through a priority-aware stack helper
- README/help copy mentions the new compact challenge and overflow-priority behavior

**Step 3: Run the red phase**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared helpers and `UIScene` hooks do not exist yet.

### Task 3: Implement the first two sidebar subtasks

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add pure helpers**

- `buildRunChallengeSidebarLines`
- `buildPriorityTextStackLayout`

**Step 2: Wire `UIScene`**

- compact challenge lines on narrow viewports
- safe sidebar bottom threshold
- overflow priority that drops `eventRoomText` first, then `runModifierText` if needed

**Step 3: Update docs**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt branch preservation**

Use `feat/auto-sidebar-priority-thresholds`. If local ref creation still fails, keep working on `main`, then push `HEAD` to `refs/heads/feat/auto-sidebar-priority-thresholds` after commit so the feature branch still exists remotely.

**Step 3: Append the audit line**

Record implemented items, exact test result, merge status, push status, and blocker/fallback details in `PROGRESS.log`.
