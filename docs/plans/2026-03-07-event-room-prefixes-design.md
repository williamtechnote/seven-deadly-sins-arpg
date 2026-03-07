# Event Room Triggered Prefix Design

## Context

Resolved event-room HUD summaries already fit on one compact line, but every archetype still starts with the same generic `已选:` label. The last active TODO asks for room-type-specific prefixes so players can tell at a glance whether the resolved line is describing an effect, a trade, or healing.

## Brainstormed Subtasks

1. Replace the resolved prefix with `效果:` for `风险增益 / 祝福` rooms.
2. Replace the resolved prefix with `交易:` for `交易` rooms.
3. Replace the resolved prefix with `治疗:` for `治疗` rooms.

## Approaches

1. Patch the rendered text only in `game.js`.
   Trade-off: fast, but duplicates formatting logic outside the shared formatter.
2. Teach `shared/game-core.js` to derive the resolved prefix from room type.
   Trade-off: small shared helper, but both HUD rendering and regression checks stay deterministic. Recommended.
3. Save a preformatted resolved line in run-state.
   Trade-off: no runtime formatting, but stores presentation strings in state and makes future tweaks harder.

## Design

Keep unresolved event-room summaries unchanged. For resolved rooms, let the shared HUD summary layer produce a type-aware label prefix before the selected route: `效果:` for `祈愿圣坛 / 血契祭坛`, `交易:` for `赌徒圣坛 / 战备商柜`, and a follow-up item will later update `疗愈泉眼` to `治疗:`.

This cycle only implements the first two subtasks. That means resolved blessing/risk-buff and trade rooms will switch away from `已选:` immediately, while healing rooms intentionally keep the old prefix so the final TODO item remains active and auditable.

## Testing

Add regression coverage for:
- resolved `祈愿圣坛` summaries and HUD lines using `效果:`
- resolved `血契祭坛` summaries using `效果:`
- resolved `赌徒圣坛` summaries and HUD lines using `交易:`
- unresolved event-room summaries remaining unchanged
