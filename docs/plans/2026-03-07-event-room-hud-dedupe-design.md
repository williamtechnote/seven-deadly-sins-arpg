# Event Room HUD Dedupe Design

## Context

The event-room HUD already compresses unresolved choices, but resolved rooms still spend two lines on the same decision: one `已选 ...` route line and one `结算:` line. The remaining active TODO is to remove that repetition without hiding which option the player actually picked.

## Brainstormed Subtasks

1. Compress the resolved chosen-route line to a short label-only form.
2. Merge the resolved chosen-route label and settlement delta into one HUD line.
3. Keep a follow-up TODO for archetype-specific prefixes if the merged line still feels noisy.

## Approaches

1. UI-only string trimming in `game.js`.
   Trade-off: quick, but duplicates formatting rules outside the shared logic layer.
2. Shared HUD formatter in `shared/game-core.js`.
   Trade-off: slightly more structure, but deterministic and regression-testable. Recommended.
3. Persist a prebuilt HUD line in save data.
   Trade-off: avoids runtime formatting, but stores presentation data instead of deriving it from source state.

## Design

Keep unresolved event-room summaries unchanged. For resolved rooms, make `buildRunEventRoomHudSummary()` return a short chosen-route label like `已选: 迅击祷言` instead of repeating the effect payload on that line.

Add a shared HUD line composer that turns the resolved chosen route plus compact settlement text into a single line such as `已选: 豪赌 · 生命-30, 金币+120`. `game.js` should render those shared lines directly so the CLI regression script can verify the exact user-facing output.

This cycle implements the first two subtasks and leaves the archetype-specific prefix tuning as the remaining active follow-up.

## Testing

Add regression coverage for:
- resolved `祈愿圣坛` summaries returning a label-only chosen-route line
- resolved `赌徒圣坛` summaries returning a label-only chosen-route line
- final HUD lines merging chosen route + compact settlement into one line
