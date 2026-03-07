# Event Room Healing Prefix Design

## Context

Resolved event-room HUD summaries already use room-type-specific prefixes for blessing/risk-buff (`效果:`) and trade (`交易:`) rooms. Healing rooms still fall back to the generic `已选:` label, which makes the final active HUD-prefix task inconsistent with the other archetypes.

## Brainstormed Subtasks

1. Switch resolved healing-room chosen-route summaries from `已选:` to `治疗:`.
2. Sync regression coverage and README wording so the healing prefix is documented and enforced.
3. Keep unknown/future room types on the generic `已选:` fallback to avoid over-specializing the formatter.

## Approaches

1. Patch the rendered HUD text only in `game.js`.
   Trade-off: smallest runtime change, but formatting rules drift away from the shared summary helpers and CLI regression checks.
2. Extend the shared resolved-prefix helper in `shared/game-core.js`.
   Trade-off: one small shared change, but Phaser HUD output and regression checks stay consistent. Recommended.
3. Store a preformatted chosen-route prefix in event-room state.
   Trade-off: avoids runtime branching, but mixes presentation into persisted state and makes future copy changes noisier.

## Design

Keep unresolved event-room routes unchanged. For resolved rooms, extend the shared prefix mapper so `healing` rooms emit `治疗:` while `trade`, `riskBuff`, and `blessing` keep their current type-specific prefixes. Unknown room types continue to fall back to `已选:`.

The heartbeat also updates regression checks and README copy in the same cycle, so the final visible behavior, documentation, and automated verification all describe the same healing-room output.

## Testing

- Update resolved healing-room HUD summary expectations to `治疗:`.
- Update resolved healing-room HUD line expectations to the merged single-line `治疗: ... · ...` format.
- Keep existing blessing/trade assertions unchanged to confirm no regression in the already-shipped prefixes.
