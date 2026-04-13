# ARPG Pre-Commit Objective Forecast

## Why This Exists

`下间缓冲 / 下间高压 / 下间淘金` 与 `首拍兑现 / 稳场兑现 / 追赏兑现` 已经能告诉玩家“下一房是什么路线、何时开始回本”，但在真正进房前，choice panel 与已触发摘要还没有直接回答更窄的问题: “第一拍先做什么”。

当前 repo 已经在 room entry 后半拍补 `先稳前排 / 先拆夹角 / 先盯后排`。若这条 one-shot cue 本身可读，下一步最高 ROI 的扩展不是再加常驻 HUD，而是把同一条首拍问题前移到已经存在的 pre-commit surface。

## Sources That Support The Rule

- Thomas Grip argues that gameplay feels better when players can plan ahead instead of only reacting after contact.
- Mike Stout's telegraphing guidance fits the same constraint: players cannot answer a combat question they were never shown.
- "Using feedback as a teacher in video games" frames readable feedback as answering `What am I doing?` and `Why/When do I do it?`, which is exactly what a first-beat objective forecast should do.

## Repo Rule

当 routed encounter 已在 shrine 结算时被确定，pre-commit surface 可以前移一条 shared first-beat objective forecast，但必须遵守三个边界:

1. 只在已经知道 route 的 surface 上显示。
   事件房 choice panel、侧栏摘要、已触发后的世界/HUD 摘要都可以；portal hover 不可以，因为那时 route 尚未生成。

2. 只给一个可执行动词结论。
   `先稳前排 / 先拆夹角 / 先盯后排` 足够。不要把 formation staging、payoff timing、recommendation reason 全塞进同一条文案。

3. 进房后的 objective cue 仍然保留。
   pre-commit forecast 负责让玩家在做选择时形成计划；room-entry cue 负责在真正接敌时再次确认，而不是互相替代。

## Contract For This Repo

- 复用 shared encounter profile 到 objective 的同一套映射，避免 shrine preview、room-entry cue、README 与 regression 文案漂移。
- shrine side copy 优先保住 `下间X` + `首拍目标` 这两个锚点，不额外引入 Boss posture 或未确定 route 的推断。
- 若 route 缺失或房间尚未确定，不显示 objective forecast。
- README、help overlay、regression checks 与 shared helper 必须锁同一组短句。

## References

- Thomas Grip, "Planning - The Core Reason Why Gameplay Feels Good": https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Mike Stout, "Enemy Attacks and Telegraphing": https://www.chaoticstupid.com/enemy-attacks-and-telegraphing/
- Game Developer, "Using feedback as a teacher in video games": https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
