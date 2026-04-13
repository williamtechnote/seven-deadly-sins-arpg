# Encounter Objective Cue Design

## Context

当前第三房已经有完整的 routed encounter language: shrine preview 会给出 `下间缓冲 / 下间高压 / 下间淘金`，进房时会补 `缓冲战 · 双拍缓冲` / `高压战 · 三向成压` / `淘金战 · 后排赏金`，后续还有 source cue、clear recap 与 Boss handoff。缺口在于这些 cue 仍主要回答“这房是什么路线”，没有直接回答“第一拍先处理谁”。

方法论文档已经给出高 ROI 方向:

- route 改写应在 30 秒内可感知，最好更早
- HUD / world feedback 需要把上一次抉择转成当前可执行动作
- 新 cue 应尽量复用 shared logic，而不是额外造新 HUD 面板

## Options

1. 继续扩长 entry preview 文案。
Rejected: 会让首屏第一条 cue 变得更长，但不会改善玩家把 route identity 转成首拍动作的速度。

2. 新增常驻 objective 面板。
Rejected: 这会创造新的 HUD 表面，成本高，也容易和现有 entry/source cue 重叠。

3. 在 entry preview 之后补一个一次性的 objective cue。
Recommended: 仍沿用 shared helper + floating text，只再落一条更窄的战术短句，把 route identity 收束成第一拍动作。

## Chosen Direction

新增 shared helper `buildRunEventEncounterObjectiveCue(profile)`，统一输出:

- `缓冲战` -> `先稳前排`
- `高压战` -> `先拆夹角`
- `淘金战` -> `先盯后排`

`LevelScene` 在第三房 entry preview 触发后，再延迟半拍补这条 objective cue。它是 one-shot follow-up，不替代现有 entry preview / source cue / clear recap，只负责把 route identity 收束成首拍战术。

## Success Criteria

- 第三房进房提示之后，会再补一次短 objective cue。
- objective cue 只触发一次，并跟随当前 routed encounter profile。
- shared helper、runtime hook、README、help overlay、regression checks 使用同一组短句。
