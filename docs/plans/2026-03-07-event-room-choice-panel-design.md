# Event Room Choice Panel Design

**Context**

`TODO.md` had no active work for this heartbeat, while the current code and regression suite are focused on event-room readability and fallback stability. This design seeds the next three TODO items in that same stream and implements the first two this cycle.

**Approaches**

1. Recommended: move choice-preview formatting and failure-message mapping into `shared/game-core.js`, then reuse those helpers from `game.js` and the regression suite. This keeps the new behavior testable in CLI and avoids duplicating formatting rules between HUD and panel UI.
2. Scene-only patch: hardcode compact option copy and blocker text inside `game.js`. This is faster to type, but it would duplicate summary rules and make regression coverage weaker because the behavior would live only in Phaser scene code.
3. Bigger UI pass: redesign the whole event-room panel with more widgets, icons, and persistent state. This would add surface area without addressing the immediate UX gaps and is out of scope for one heartbeat.

**Chosen Design**

- Add a shared helper that formats a choice into a compact preview line. The choice panel will render `label + compact preview` instead of the long raw description so the player sees the same shorthand used by the HUD.
- Add a shared helper that maps failed event-room resolutions to explicit player-facing blocker text. The choice panel will stay open on failure, update its footer with the blocker, and highlight the footer in a warning color instead of silently closing.
- Leave a third TODO active for a later cycle: add the chosen-route short summary to the world-space shrine label after settlement.

**Testing**

- Extend `scripts/regression-checks.mjs` with failing tests for the new shared helpers.
- Keep the existing required heartbeat verification command unchanged after implementation.
