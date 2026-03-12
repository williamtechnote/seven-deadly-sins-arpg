# Phaser 真场景自动化测试设计

## 目标

为当前 Phaser 浏览器游戏补齐无人值守的自动化测试与排错机制，覆盖真实场景、真实浏览器、真实输入，并在失败时自动产出可复现证据。

## 约束

- 必须跑真实 Phaser 场景，不能只测纯逻辑。
- 必须启动真实游戏页面，在浏览器里执行键盘/鼠标输入。
- 关键路径至少覆盖：开局、进入关卡、战斗、掉落或结算。
- 失败时必须保留截图、console error、关键状态快照、seed 和输入脚本。
- 现有项目是无构建的原生 `index.html + game.js`，并依赖 Phaser CDN。

## 方案对比

### 方案 A：纯黑盒浏览器自动化

- 做法：Playwright 只点击/按键，不改游戏代码。
- 优点：侵入最小。
- 缺点：随机性高、可观测性弱、失败定位慢、长流程极不稳定。

### 方案 B：测试模式 + 最小 hooks + Playwright

- 做法：通过 URL 参数启用 `test mode`，固定 seed，暴露只读状态快照和少量测试辅助操作，Playwright 仍用真实键鼠驱动主流程。
- 优点：可重复、可诊断、对线上逻辑侵入小。
- 缺点：需要在游戏里加少量测试分支。

### 方案 C：测试模式 + 大量控制台命令

- 做法：大量开放传送、秒杀、刷物品等命令，让 E2E 主要靠 hooks 过流程。
- 优点：实现快。
- 缺点：容易把“自动化”退化成假流程，真实输入覆盖不足。

## 结论

采用方案 B。

- 主流程仍由 Playwright 真实键鼠执行。
- 仅在 `test mode` 下开放最小 hooks：
  - 当前场景/运行态快照
  - 固定 seed 与测试 flag
  - 非破坏性的测试辅助，例如加速/简化路线、导出输入日志、读取关键对象位置
- 对极长流程 soak 允许使用有限辅助，但每局仍由真实输入触发开局、战斗和结算。

## 设计

### 启动与环境

- 新增本地静态服务脚本，默认服务仓库根目录。
- 游戏支持读取 URL 参数：
  - `testMode=1`
  - `seed=<number>`
  - `boss=<key>` 可选
  - `testScenario=<name>` 可选
- `index.html` 优先加载本地 `vendor/phaser.min.js`，失败再回退 CDN，避免离线/CI 不稳定。

### 游戏内测试能力

- 新增统一测试上下文，负责：
  - 解析 URL 参数
  - 安装 seeded RNG
  - 记录输入脚本
  - 采集关键事件与 console error
  - 暴露 `window.__SDS_TEST__`
- `window.__SDS_TEST__` 只在测试模式下启用，提供：
  - `getSnapshot()`
  - `getInputLog()`
  - `getConsoleErrors()`
  - `getEvents()`
  - `waitFor(predicateKey, timeoutMs)` 的简化浏览器侧组合能力
- 场景进入/退出、敌人死亡、掉落拾取、Boss 胜利、结算等事件写入统一 event log。

### 浏览器回归

- 使用 Playwright。
- 配置统一失败证据：
  - screenshot
  - trace
  - browser console
  - 页面导出的状态快照 JSON
  - seed 与输入脚本 JSON
- 测试分层：
  - `smoke`：标题到 Hub 到 Level 成功
  - `combat`：真实清怪，验证掉落/挑战/胜利结算
  - `longrun`：多轮自动化回放，统计失败率

### 真实输入策略

- 菜单和按钮用鼠标点击。
- 战斗与移动用键盘：
  - `WASD`
  - `IJKL`
  - `U/O`
  - `F`
- 必要时用鼠标点击标题或 UI 按钮，避免对隐藏 focus 的不确定性。

### 失败证据

- Playwright 自带截图/trace。
- 额外写入 `artifacts/e2e/<test-name>/`：
  - `snapshot.json`
  - `events.json`
  - `console-errors.json`
  - `input-log.json`
  - `meta.json`（seed、scenario、URL、时间）

## 风险

- 现有 CDN Phaser 依赖会导致离线失败，因此需要本地兜底。
- 原生随机源散落在 `Math.random()`，必须统一改成可切换 seeded RNG。
- 长流程全靠真实战斗可能不稳定，因此测试模式需要有限“稳定化”而不是“跳过流程”。
