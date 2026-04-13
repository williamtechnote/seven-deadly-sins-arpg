# ARPG Boss Victory Closure Contract

## Why This Exists

This repo already carries shrine-route identity across choice, resolve, room-3 entry, room-3 payoff, and room-3 clear recap. The remaining gap is post-boss closure: if the route falls silent once the boss dies, the player loses the final answer to `这段路线最后带来了什么`.

For a short-run ARPG, victory feedback should not only say `你赢了`; it should also briefly restate why the last run segment mattered.

## Practical Rule

When a route already survives through the routed encounter clear recap, the boss victory summary should add one final closure beat:

1. route segment identity
2. boss defeat reward
3. run-state progress

Keep the route line short enough to live inside the existing victory summary without replacing core rewards.

## Contract For This Repo

- Reuse the routed encounter profile as the source of truth.
- Reuse the same payoff-moment mapping already used by the routed encounter helpers.
- Prefer a single compact line over a second floating-text burst.
- Keep the copy in the victory summary so the player reads it alongside rewards and `罪之印记`.
- Stay silent when no routed encounter profile exists.

## Recommended Copy Shape

- `缓冲路线 · 稳线收束`
- `高压路线 · 顶压收束`
- `淘金路线 · 带赏收束`

This keeps the route identity readable while clearly signaling that the segment has now fully paid off.

## Source Notes

- Game Developer, "Using feedback as a teacher in video games" (2021): feedback should answer what happened and why after the action, not only during it.
- Game Developer, "Feedback in games - how to design rewards and punishments?" (2022): delayed consequences still need clear feedback so players can connect earlier choices to later outcomes.
