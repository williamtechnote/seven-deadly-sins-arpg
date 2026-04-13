# Action-Route Boss Posture Extension Design

## Goal

Extend the new Boss-posture recommendation tiebreaker from the broad blessing lanes into the remaining finer-grained action-route shrines.

## Context

The repo already proves three things:

- portal focus can frame the next Boss with one compact posture cue
- event-room recommendations can use Boss posture for a small set of high-confidence shrine pairs
- routed encounter feedback can preserve that same reason after the choice

The remaining gap is the finer-grained action-route shrines. They already understand live combat bottlenecks, but when live state is quiet they still fall back to silence even if the current target Boss strongly implies a posture.

## Chosen Direction

Add a narrow Boss-posture tiebreaker to the remaining action-route shrines:

- `镇压圣坛` -> `镇步修习 · 目标Boss更宜控场`
- `战势圣坛` -> `借势修习 · 目标Boss更宜借势`
- `连携圣坛` -> `催锋修习 · 目标Boss更宜连段`
- `反击圣坛` -> `追猎修习 · 目标Boss更宜追猎`
- `反击圣坛` -> `调息修习 · 目标Boss更宜回体`

The route should stay silent whenever a stronger live HP / stamina / cooldown / loadout reason already exists.

## Design Notes

- Reuse shared Boss-posture reason constants.
- Reuse the existing routed encounter echoes where they already fit the new reasons.
- Avoid new scene wiring; `bossKey` is already present in the shared recommendation state.

## Testing

- Add RED assertions for the new action-route footer messages.
- Add routed encounter entry / clear / source-cue assertions for the same reasons.
- Keep README wording aligned with the new examples.

## Assumption

This heartbeat is executing in a non-interactive automation flow, so the design is treated as self-approved for the cycle.
