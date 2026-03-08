# Sidebar Narrow-Viewport Line Caps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable narrow-viewport line-cap helper for the fixed right sidebar and apply it to the longest sidebar blocks so they stop growing unbounded on smaller viewports.

**Architecture:** Keep the pure width-and-line-cap logic in `shared/game-core.js`, then let `UIScene` decide when the current viewport counts as compact and route the run-modifier and event-room blocks through that helper. Update README/help copy, TODO, and audit logging in the same cycle.

**Tech Stack:** Plain JavaScript, Phaser 3 UI scene code, Node regression script

---

### Task 1: Split the active TODO into three concrete sub-items

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-09-sidebar-line-caps-design.md`
- Create: `docs/plans/2026-03-09-sidebar-line-caps-plan.md`

**Step 1: Replace the broad evaluation item**

- 窄视口下为本局词缀列表补充行数上限 + 末行省略
- 窄视口下为事件房摘要补充行数上限 + 末行省略
- 继续评估未来新增区块的阈值 / 优先级策略

**Step 2: Leave the third item active after this heartbeat**

Run: `sed -n '1,12p' TODO.md`
Expected: the first two items are completed in this heartbeat and the third remains active.

### Task 2: Write failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add pure helper coverage**

```js
assert.equal(typeof clampTextLinesToWidthAndCount, 'function');
assert.deepEqual(
  clampTextLinesToWidthAndCount(['第一条超长内容', '第二条超长内容', '第三条超长内容'], 40, 2, { measureGlyphWidth }),
  ['第一…', '第二…']
);
```

**Step 2: Add narrow-viewport source-hook assertions**

```js
/_getHudSidebarLineCap\(sectionKey\)\s*{/
/_fitHudSidebarTextBlock\(modifierLines,\s*this\._getHudSidebarMaxWidth\(\),\s*'runModifierSidebar',\s*'runModifierSidebar'\)/
/_fitHudSidebarTextBlock\(lines,\s*this\._getHudSidebarMaxWidth\(\),\s*'eventRoomSidebar',\s*'eventRoomSidebar'\)/
```

**Step 3: Run red phase**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the shared helper and `UIScene` hooks do not exist yet.

### Task 3: Implement the first two TODO items

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Add the shared line-cap helper**

- export `clampTextLinesToWidthAndCount`
- reuse the existing width clamp logic
- ellipsize the final visible line if additional lines were dropped

**Step 2: Apply narrow-viewport line caps to volatile sidebar blocks**

- add compact-sidebar viewport detection
- cap `本局词缀` lines
- cap `事件房摘要` lines

**Step 3: Update README and help overlay wording**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Attempt branch/commit integration**

Use branch name `feat/auto-sidebar-line-caps`. If local branch creation still fails with the ref-lock permission error, keep working on `main`, push `HEAD` to `refs/heads/feat/auto-sidebar-line-caps`, then push `main` after commit/merge.

**Step 3: Append audit**

Record implemented items, exact verification result, branch outcome, merge status, push status, and blocker/fallback details in `PROGRESS.log`.
