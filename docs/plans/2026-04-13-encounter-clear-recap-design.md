# Encounter Clear Recap Design

## Context

`缓冲战 / 高压战 / 淘金战` 现在已经会在 shrine 结算、第三房入口与关键击杀节点暴露 route identity：玩家能提前知道“下一房偏什么”，进门第一秒也能读到 `缓冲战 · 双拍缓冲` / `高压战 · 三向成压` / `淘金战 · 后排赏金`，而 `淘金战` 的高赏金目标死亡时还会补 `赏金+X`。但当第三房真正被清空、Boss 门点亮时，路线叙事又会突然断掉，玩家缺少一句“这条路线刚刚是怎样兑现完成的”短收束。

方法论文档给出的方向也一致：

- route identity 应该跨 1-3 个房间形成完整段落，而不是只在入口出现一次
- world feedback hierarchy 要能回答 “上一条决策刚刚带来了什么结果”
- 高 ROI TODO 应优先强化短时间内可感知、可测试、可复用的 run-arc 可读性

## Options

1. 在 README / 事件房摘要里追加更多解释文案。  
Rejected: 这会改善静态说明，但无法补上第三房清场这一瞬间的 runtime 闭环。

2. 在 Boss 门旁新增常驻 route 标签。  
Rejected: 这会引入新的持久 UI 面，且容易和门、Boss 标签竞争注意力；对一次 heartbeat 来说过重。

3. 复用现有 floating-text 反馈，在第三房全清瞬间补 shared recap cue。  
Recommended: 这条路径最贴近现有入口预告与赏金回执 contract，可以把 shared 文案、runtime hook、README 与 regression checks 锁成同一条 deterministic contract。

## Chosen Direction

新增 shared helper，把 resolved encounter profile 转成一条极短清场收束语：

- `缓冲战 · 稳住出清`
- `高压战 · 顶住成压`
- `淘金战 · 赏金到手`

`LevelScene` 在第三房敌人全灭、Boss 门第一次点亮时触发这条提示，并沿用现有 route color。这样 route identity 会形成完整闭环：选择时可见、进门时可读、关键击杀时可感、清房时可收束。

## Design Notes

- shared 文案 helper 继续放在 `shared/game-core.js`，避免 `game.js` 硬编码 route-specific copy。
- runtime 只负责 one-shot gate：第三房第一次全灭时显示 recap，并与 Boss 门点亮绑定，避免重复刷屏。
- `淘金战` 的 recap 不重复 `赏金+X` 这类具体数值，而是补一条更高层的“路线承诺兑现完毕”总结句。
- README / help overlay 只补一条短 contract 说明，保持首屏可读，不新增长段叙述。

## Success Criteria

- 第三房首次清场时，会出现一条 route-colored 的短 recap cue，明确收束 `缓冲战 / 高压战 / 淘金战` 的路线身份。
- cue 只在 room 3 clear 的首次完成瞬间触发一次，不会在之后靠近 Boss 门时重复出现。
- shared helper、runtime source hook、README/help copy 都有 deterministic regression coverage。
- 改动不引入新的常驻 UI，也不改变 Boss 门开启条件或战斗数值。
