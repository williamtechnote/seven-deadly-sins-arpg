# Event Room HUD Wrap Design

## Context

The remaining active TODO is `HUD 事件房文案换行与压缩优化`.

The current HUD renders event room info as:
- room name
- `类型 ... · 状态: ...`
- one long `路线: ... | ...` line for unresolved rooms
- one long `结算: ...` line after resolution

That format keeps the full information, but the unresolved route line is too dense and the metadata line spends too many characters on labels instead of useful content.

## Brainstormed Follow-Ups

1. Route lines per choice
   Render unresolved routes as one compact line per choice instead of one `|`-joined sentence.
2. Metadata compression
   Collapse `类型 ... · 状态: ...` into short tags so the HUD spends less width on labels.
3. Resolution compression
   Reuse the compact route formatter after settlement and keep the free-form resolution text on a separate shorter line.

## Approaches

### Approach A: UI-only word-wrap tuning

Keep the current summary strings and only change Phaser text width / line spacing.

Trade-off: smallest code change, but brittle. It does not solve the root issue because the strings themselves stay verbose.

### Approach B: Shared formatter returns compact HUD-ready pieces

Move the compression rules into `shared/game-core.js`, return structured route lines and short labels, and let `game.js` render those lines directly.

Trade-off: slightly more refactor, but it is deterministic, testable in CLI regression checks, and reusable anywhere the HUD summary is shown.

### Approach C: Dedicated event-room mini panel

Split the event room block into multiple text nodes or a boxed widget.

Trade-off: best presentation control, but too large for this heartbeat and not required by the TODO.

## Recommendation

Use Approach B.

It addresses the actual problem, keeps the current HUD layout intact, and fits the existing regression-test pattern in `scripts/regression-checks.mjs`.

## Approved Scope For This Heartbeat

Implement the earliest two subitems:

1. Route lines per choice for unresolved/resolved summaries.
2. Metadata compression for the type/state line.

Keep the third subitem in TODO for a later heartbeat:

3. Further compression/normalization of settlement wording where room-specific strings are still verbose.
