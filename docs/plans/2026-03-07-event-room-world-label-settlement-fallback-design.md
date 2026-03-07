# Event-Room World Label Settlement-Only Fallback Design

## Context

The remaining Active TODO is narrower than the existing unknown-type fallback rules. When the event definition still exists, the altar label should keep reusing the generic `已选:` route fallback that earlier heartbeats added. The gap is the final future-expansion case: if a resolved event room no longer exists in the current pool, the world-label helper loses both the route summary and the normalized room name, so the altar label collapses to an empty string instead of falling back to `房名 · 已结算`.

## Approaches

1. Leave the helper normalized-only.
   Trade-off: simplest, but once the event definition disappears the label still loses the persisted room name and cannot show any fallback.

2. Let the world-label helper fall back to persisted fields from the raw saved room object.
   Trade-off: one small shared fallback path, but it preserves the altar label even when the live event pool no longer knows the room. Recommended.

3. Patch the scene label in `game.js`.
   Trade-off: quick, but it duplicates shared formatting logic and leaves the CLI regression path blind to the bug.

## Design

This heartbeat breaks the umbrella TODO into three concrete follow-ups:

1. Resolved altar labels keep using the persisted room name even when the live event definition is gone.
2. Unknown/future resolved altar labels fall back to `房名 · 已结算` when no route summary is available.
3. README and regression coverage describe the persisted-name fallback so future room-pool removals keep the altar readable.

Implementation stays in `shared/game-core.js`. `buildRunEventRoomWorldLabel()` will keep its current normalized path for known definitions, but when normalization fails it will fall back to the raw saved room object. That raw fallback only needs the persisted room name plus resolved status to produce `房名 · 已结算`, leaving the existing `已选:` behavior untouched whenever a usable room definition still exists.

## Testing

- Add a regression where a resolved future/unknown event room key is missing from the current pool but the saved room still contains `name: 谜藏书库`.
- Assert `buildRunEventRoomWorldLabelRouteLine()` remains empty for that orphaned definition.
- Assert `buildRunEventRoomWorldLabel()` falls back to `谜藏书库 · 已结算`.
- Run the required syntax checks and `node scripts/regression-checks.mjs`.
