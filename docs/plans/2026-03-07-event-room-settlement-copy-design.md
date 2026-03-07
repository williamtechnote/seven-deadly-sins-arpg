# Event Room Settlement Copy Design

## Context

The event-room HUD already compresses unresolved routes well, but resolved rooms still show a verbose chosen-route line plus a verbose `结算:` line. The remaining active TODO asks for additional compression by room type.

## Brainstormed Subtasks

1. Trade rooms: shorten resolved settlement copy for `赌徒圣坛` and `战备商柜`.
2. Healing rooms: shorten resolved settlement copy for `疗愈泉眼`.
3. Buff/blessing rooms: shorten resolved settlement copy for `血契祭坛` and `祈愿圣坛`.

## Approaches

1. Generic string trimming.
   Trade-off: fastest, but fragile and likely to break localization or spacing.
2. Type-aware settlement formatter.
   Trade-off: slightly more code, but deterministic and testable. Recommended.
3. Store separate HUD-only copy in event definitions.
   Trade-off: explicit, but duplicates logic that already exists in settlement resolution.

## Design

Use a dedicated HUD settlement formatter in `shared/game-core.js` that derives compact resolved copy from effect type and actual outcome. Keep unresolved route summaries unchanged. For resolved rooms, keep the chosen-route line compact and expose a shorter `resolutionText` tailored to the room type so the HUD can show concrete deltas without long prose.

This cycle implements the first two subtasks:
- Trade rooms: format compact deltas like `生命-30, 金币+120` and `金币-45, 净化药剂x1`.
- Healing rooms: format compact deltas like `生命+36, 净化`.

The remaining follow-up keeps buff/blessing text as the next active TODO because those summaries are already relatively short.

## Testing

Add regression coverage that proves the new compact resolved summary for:
- `赌徒圣坛` after `highStakeWager`
- `战备商柜` after `fieldTonic`
- `疗愈泉眼` after `purifyingSip`
