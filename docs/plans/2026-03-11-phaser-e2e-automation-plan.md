# Phaser E2E Automation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为当前 Phaser 游戏补齐真实场景 + 真实浏览器 + 真实输入的自动化回归与排错机制。

**Architecture:** 在游戏侧增加仅测试模式启用的 deterministic harness，与仓库侧 Playwright 测试、静态服务脚本、证据归档配套。真实输入负责驱动关键流程，hooks 只提供状态观察、seed 固定和最小稳定化辅助。

**Tech Stack:** 原生 JavaScript、Phaser 3、Playwright、Node.js 静态服务脚本

---

### Task 1: 搭建测试脚手架

**Files:**
- Create: `package.json`
- Create: `playwright.config.js`
- Create: `scripts/e2e-server.mjs`
- Create: `tests/e2e/helpers/game-driver.js`
- Create: `tests/e2e/smoke.spec.js`
- Create: `tests/e2e/combat.spec.js`
- Create: `tests/e2e/longrun.spec.js`

**Step 1: Write the failing test**

先写 Playwright 用例，断言页面能暴露测试 hooks、能从标题进入 Hub/Level，并能生成证据目录。

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/smoke.spec.js --project=chromium`
Expected: FAIL，原因是缺少 Playwright 配置/依赖或页面中没有测试 hooks。

**Step 3: Write minimal implementation**

补齐 `package.json`、Playwright 配置、静态服务与测试 helper，让测试基础设施可启动。

**Step 4: Run test to verify it passes**

Run: `npm run e2e:smoke`
Expected: 浏览器可启动，但仍可能因游戏侧 hooks 缺失而失败；基础设施应完成。

**Step 5: Commit**

```bash
git add package.json playwright.config.js scripts/e2e-server.mjs tests/e2e
git commit -m "test: scaffold phaser browser e2e harness"
```

### Task 2: 在游戏中加入测试模式与快照

**Files:**
- Modify: `index.html`
- Modify: `game.js`
- Create: `scripts/e2e/phaser-test-harness.js`
- Create: `vendor/phaser.min.js`

**Step 1: Write the failing test**

新增测试断言：
- `window.__SDS_TEST__` 只在 `testMode=1` 时存在
- `getSnapshot()` 返回当前场景、玩家、Boss/敌人、掉落、挑战、seed、events

**Step 2: Run test to verify it fails**

Run: `npm run e2e:smoke`
Expected: FAIL，提示 hooks 或 snapshot 字段不存在。

**Step 3: Write minimal implementation**

实现测试上下文、seed RNG、本地 Phaser 加载兜底、最小 hooks 和事件记录。

**Step 4: Run test to verify it passes**

Run: `npm run e2e:smoke`
Expected: PASS，标题 -> Hub -> Level 成功，且可导出状态快照。

**Step 5: Commit**

```bash
git add index.html game.js scripts/e2e/phaser-test-harness.js vendor/phaser.min.js
git commit -m "test: add deterministic phaser test mode hooks"
```

### Task 3: 完成真实战斗/掉落/结算回归

**Files:**
- Modify: `game.js`
- Modify: `tests/e2e/helpers/game-driver.js`
- Modify: `tests/e2e/combat.spec.js`

**Step 1: Write the failing test**

写 `combat` 用例，要求真实键鼠完成：
- 进入关卡
- 击杀至少 1 名敌人并拾取掉落
- 进入 Boss 战并完成一次结算断言

**Step 2: Run test to verify it fails**

Run: `npm run e2e:combat`
Expected: FAIL，原因是流程不稳定或缺少快照/事件支持。

**Step 3: Write minimal implementation**

补足事件记录、辅助导航/稳定化逻辑、证据导出与断言 helper。

**Step 4: Run test to verify it passes**

Run: `npm run e2e:combat`
Expected: PASS，证据目录存在。

**Step 5: Commit**

```bash
git add game.js tests/e2e/helpers/game-driver.js tests/e2e/combat.spec.js
git commit -m "test: cover combat drops and settlement flow"
```

### Task 4: 增加长流程 soak 与报告脚本

**Files:**
- Create: `scripts/e2e-report.mjs`
- Modify: `tests/e2e/longrun.spec.js`
- Modify: `package.json`

**Step 1: Write the failing test**

让 `longrun` 以多 seed 重复跑，并输出汇总 JSON。

**Step 2: Run test to verify it fails**

Run: `npm run e2e:longrun`
Expected: FAIL，原因是未输出 soak 结果或失败率统计。

**Step 3: Write minimal implementation**

实现多轮执行、失败归档和可选 report 汇总。

**Step 4: Run test to verify it passes**

Run: `npm run e2e:longrun`
Expected: PASS 或带可诊断失败产物。

**Step 5: Commit**

```bash
git add scripts/e2e-report.mjs tests/e2e/longrun.spec.js package.json
git commit -m "test: add longrun soak report"
```

### Task 5: 更新文档并验证

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

用文档检查或人工核对命令，确保 README 包含启动、依赖、脚本、证据目录说明。

**Step 2: Run test to verify it fails**

Run: `grep -n "e2e:smoke\\|e2e:combat\\|e2e:longrun" README.md`
Expected: 还未覆盖完整说明。

**Step 3: Write minimal implementation**

补充 README 测试章节。

**Step 4: Run test to verify it passes**

Run: `npm run e2e:smoke && npm run e2e:combat`
Expected: 至少 smoke/combat 完成实测，结果可汇报。

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document browser regression workflow"
```
