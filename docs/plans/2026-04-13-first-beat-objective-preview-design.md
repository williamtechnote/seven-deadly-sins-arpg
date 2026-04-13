# First-Beat Objective Preview Design

## Context

GitHub `main` 已经把 routed encounter 做到了三层:

- shrine side 会预告 `下间缓冲 / 下间高压 / 下间淘金`
- room-3 entry 会补 `缓冲战 · 双拍缓冲` / `高压战 · 三向成压` / `淘金战 · 后排赏金`
- 半拍后还会补 `先稳前排` / `先拆夹角` / `先盯后排`

缺口在于 pre-commit surface 仍停在 route category，没有直接把 route 收束成“第一拍先做什么”。方法论文档已经给出方向:

- `arpg-encounter-forecast-signposting.md` 要求 preview 提前暴露下一房 asks 什么
- `arpg-room-entry-objective-ladder.md` 已定义 shared objective vocabulary
- 新增的 `arpg-precommit-objective-forecast.md` 进一步约束: 这条 objective 只能前移到已经知道 route 的 shrine-side surface，不能硬塞进 portal hover

## Options

1. Keep the current room-entry one-shot only.
Rejected: 可读性安全，但玩家在做 shrine 决策时仍只能看到 route category，看不到第一拍动作。

2. Add the same first-beat objective to shrine-side previews and resolved summaries.
Recommended: route 已在该时刻确定，且已有 compact preview lane，可直接前移同一条 shared objective 而不新增 HUD。

3. Push the objective all the way into portal hover.
Rejected: portal focus 发生在 route 生成之前，会凭空制造未来信息，破坏当前 repo 的因果顺序。

## Chosen Direction

在已有 routed encounter preview 的 shrine-side surface 上追加 compact first-beat objective forecast:

- `下间缓冲 · 先稳前排`
- `下间高压 · 先拆夹角`
- `下间淘金 · 先盯后排`

实现上应复用 shared helper，把 objective preview 接到:

- choice panel route lines
- resolved HUD / sidebar summary

room-entry preview `缓冲战 · 双拍缓冲` 与半拍后的 objective cue 继续保留，作为进房后的 contact confirmation。

## Success Criteria

- 事件房 choice panel 与已触发摘要都会把 routed encounter preview 前移到 `下间X · 首拍目标`。
- 未确定 route 时保持静默，不 invent preview。
- portal hover summary 不变，不引入未来 route 推断。
- regression checks、README、help overlay 与 shared helper 使用同一组 objective preview 短句。
