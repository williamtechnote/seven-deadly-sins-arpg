# Roll Lockout Action HUD Design

**Context**

左下角行动 HUD 目前会根据冷却与体力显示 `就绪` / 冷却秒数 / `差X体` / 冷却后体力缺口预告，但没有把翻滚锁定态算进去。实际战斗里，玩家在翻滚无敌帧内无法普攻、特攻，也不能再次翻滚；HUD 却可能继续显示 `就绪`，这会制造“按键失灵”的错觉。

**Approaches**

1. 只在 README / 操作指引补文字说明。
   成本最低，但 HUD 仍会继续对玩家说错话。
2. 仅在 `game.js` 场景层硬编码 `isDodging ? 翻滚中 : ...`。
   能修复当前场景，但会绕开现有共享 helper，回归面也更碎。
3. 在 `shared/game-core.js` 的行动 HUD helper 内新增翻滚锁定标签，并由 `game.js` 显式传入 `player.isDodging`。
   改动最小、可测试、且 HUD 文案逻辑继续集中在共享层。

**Recommendation**

选择方案 3。
- 当 `isDodging` 为真时，三项行动统一显示 `翻滚中`
- 冷却 / 体力逻辑维持现有优先级，只在翻滚锁定时整体覆盖
- `README.md` 与游戏内操作指引同步说明 HUD 现在会显式标出翻滚锁定

**Testing**

- 先在 `scripts/regression-checks.mjs` 为 `buildCombatActionHudSummary` 写失败断言，要求翻滚期间返回三段 `翻滚中`
- 再加一条 source-hook 断言，确保 `game.js` 把 `player.isDodging` 传给共享 helper
- 最后同步 README / help overlay 文案断言，锁定玩家可见说明
