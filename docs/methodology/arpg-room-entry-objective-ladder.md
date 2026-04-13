# ARPG Room-Entry Objective Ladder

## Purpose

`缓冲战 / 高压战 / 淘金战` 这类 route identity 已能告诉玩家“这一房是什么气质”，但高压 ARPG 还需要再回答一个更窄的问题: “第一拍先处理谁”。本说明用于约束 room-entry objective cue，避免 route readability 继续停在解释层，而没有落到首个战术动作。

## Core Rule

每种 routed encounter 都应在进房后约 1 秒内给出一个可执行的首拍目标，而且只给一个:

- `缓冲战` -> 先稳前排
- `高压战` -> 先拆夹角
- `淘金战` -> 先盯后排

## Practical Constraints

- 保持 one-shot，而不是新增常驻 HUD。
- 复用 shared encounter profile，避免 scene-only 文案漂移。
- 文案只描述第一拍动作，不复述整段 formation 细节。
- 若已有 entry cue，objective cue 应作为更晚半拍的 follow-up，而不是同一拍塞进更长一句话。

## Validation Checklist

- 玩家进入第三房时，先看见 route identity，再在半拍后看见首拍目标。
- 每条 objective cue 都能和对应 formation / engage timing 对上。
- README、help overlay、regression checks 与 shared helper 保持同一组短句。
