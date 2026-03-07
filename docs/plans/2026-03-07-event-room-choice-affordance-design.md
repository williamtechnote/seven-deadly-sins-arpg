# Event Room Choice Affordance Design

**Context**

`TODO.md` had no active items for this heartbeat. The current event-room loop is stable and well covered by regressions, but the choice panel still makes players mentally estimate HP swings and affordability before selecting. This design seeds three small follow-up TODOs in that same area and implements the first two this cycle.

**Approaches**

1. Recommended: add pure shared helpers in `shared/game-core.js` that derive panel-facing affordance text from the current player state and choice definition, then render those strings from `game.js`. This keeps logic testable in CLI and avoids embedding gameplay math in Phaser scene code.
2. Scene-only formatting: compute HP deltas and gold blockers directly inside `_openRunEventChoicePanel()`. This is quicker short-term, but it duplicates gameplay rules and weakens regression coverage because the behavior is trapped in UI code.
3. Full panel redesign: add extra widgets, icons, and persistent selection state. This could look nicer, but it increases scope and risk for a single heartbeat without improving the core decision signal proportionally.

**Chosen Design**

- Add a shared helper that builds a compact state-aware panel preview for each event-room choice. It should preserve the existing route summary and append immediate HP impact where that matters.
- Add a shared helper that emits a short status tag for affordability, starting with gold-cost routes so the player can see `可负担` or `金币不足` before committing.
- Keep the third TODO item deferred: enrich the world-space shrine prompt with a compact room-type tag while the player is approaching it.

**Testing**

- Extend `scripts/regression-checks.mjs` first with failing assertions for the new preview and affordability helpers.
- Keep the required heartbeat verification command unchanged after the implementation.
