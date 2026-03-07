# Quick-Slot Text Measurement Design

**Context**

The current quick-slot fallback clamp uses shared width weights. That solved the mixed-width truncation problem without coupling Node regression checks to Phaser, but the runtime still never uses actual rendered text width even though Phaser can provide it.

**Approaches**

1. Keep width weights only
   Lowest implementation risk, but it leaves the remaining Active TODO unresolved and keeps runtime layout decisions approximate.

2. Switch the shared helper to Phaser-only measurement
   Most accurate in-game, but it breaks the shared CLI/browser contract because the regression environment cannot call Phaser text metrics.

3. Add an optional measurement hook with heuristic fallback
   Recommended. Keep `shared/game-core.js` deterministic by default, but let runtime callers inject a real text-width function when they have one. That resolves the TODO without losing Node coverage.

**Chosen Design**

- Extend the shared quick-slot clamp to accept an optional `measureLabelWidth` callback.
- Use real measured width when the callback is present; otherwise keep the existing width-weight heuristic.
- Reuse the same hook for both non-overwrite and overwrite quick-slot notices so all derived labels clamp consistently.
- In `InventoryScene`, create a hidden Phaser text probe that shares the toast font style and feed its width back into the shared helper.
- Keep one follow-up TODO only for deciding whether the same measurement path or caching should be extended elsewhere.

**Testing**

- Add a regression assertion showing a custom measurement callback can keep a label like `圣疗秘藏` within the budget while still truncating a wider suffix.
- Add a source assertion proving `InventoryScene` passes a Phaser-backed `measureLabelWidth` callback into `buildQuickSlotAutoAssignNotice()`.
- Update README/help-overlay assertions to document runtime real-width measurement with heuristic fallback.
