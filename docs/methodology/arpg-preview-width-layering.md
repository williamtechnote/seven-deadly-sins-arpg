# ARPG Preview Width Layering

## Why This Exists

`下间缓冲 · 先稳前排` 这类首拍 forecast 已经能在 shrine side 直接回答第一拍问题，但它也把更宽 surface 永久压成了同一档最短文案。结果是 player 只有等到 `遭遇:` 回执或真正进房时，才会重新看到 formation/staging 那一层战术 framing。

对这个 repo 来说，更高 ROI 的做法不是把所有 surface 都塞回长句，而是让 preview copy 按宽度分层：窄档优先保住 route + objective，宽档再恢复一层 compact staging anchor。

## Repo Rule

当 preview surface 已经知道 routed encounter，且该 surface 的预算足以容纳更长 forecast 时，可以把 shared staging anchor 接回同一条 preview：

- `下间缓冲 · 双低压 · 先稳前排`
- `下间高压 · 三敌齐压 · 先拆夹角`
- `下间淘金 · 双赏金 · 先盯后排`

但必须遵守三个边界：

1. 宽档才补 staging anchor。
   若预算不足，继续回退到 `下间X · 首拍目标`，不要为了多一层信息牺牲核心动作结论。

2. staging anchor 只描述 pre-contact 阵型问题。
   预告层用 `双低压 / 三敌齐压 / 双赏金`，不要直接把 room-entry 的 `双拍缓冲 / 三向成压 / 后排赏金` 原样搬回 shrine side。

3. `遭遇:` 回执与 room-entry cue 继续保留。
   宽档 preview 是预判层，不替代后续的 staging receipt / entry preview / objective cue。

## Contract For This Repo

- shared helper 负责选择 full / compact preview，避免 README、regression checks 与 runtime 漂移。
- choice panel 这类更宽 surface 可以优先尝试 full preview。
- 侧栏事件房摘要应按实际宽度预算决定是否保留 staging anchor。
- 未知 routed profile 必须保持静默，而不是 invent staging text。

## References

- Thomas Grip, "Planning - The Core Reason Why Gameplay Feels Good": https://www.gamedeveloper.com/design/planning---the-core-reason-why-gameplay-feels-good
- Mike Stout, "Enemy Attacks and Telegraphing": https://www.chaoticstupid.com/enemy-attacks-and-telegraphing/
- Game Developer, "Using feedback as a teacher in video games": https://www.gamedeveloper.com/game-platforms/using-feedback-as-a-teacher-in-video-games
