# Event-Room World Label Generic Prefix Design

## Context

The in-world altar label now reuses the resolved route summary for known room types, but the remaining TODO is narrower: unknown or future room types must continue showing the generic `已选:` prefix on that world label. This matters because a future expansion can leave only persisted route text behind, and the altar still needs to read like the same legacy branch the player already picked.

## Approaches

1. Keep relying on the current world-label helper implicitly.
   Trade-off: likely works for today's pool, but the intent is not protected by targeted regressions and can drift during future room-type additions.

2. Add a dedicated world-label route-line helper and test the unknown/future cases directly.
   Trade-off: one extra shared helper, but the generic prefix rule becomes explicit and reusable. Recommended.

3. Hard-code the generic prefix in `game.js`.
   Trade-off: fast, but it splits world-label formatting from the shared HUD summary rules and invites future drift.

## Design

This heartbeat narrows the single Active TODO into three sub-items:

1. Unknown/future altar labels keep `已选: <存档路线>` when a persisted route label exists.
2. Unknown/future altar labels keep `已选: 未知选项` when the persisted route label is missing.
3. README and remaining TODO stay aligned with the new safeguard for future event-room additions.

Implementation stays in `shared/game-core.js`. A small helper will derive the resolved altar route line from the shared HUD summary, and `buildRunEventRoomWorldLabel()` will compose the final `房名 · 路线` string from that helper. This keeps the generic-prefix rule in one place instead of duplicating prefix logic in the scene layer.

## Testing

- Add a regression expecting `谜藏书库 · 已选: 封印索引`.
- Add a regression expecting `谜藏书库 · 已选: 未知选项`.
- Run the required syntax checks and `node scripts/regression-checks.mjs`.
