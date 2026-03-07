# Tooltip Measurement And Quick-Slot Cache Design

**Context**

The previous heartbeat let quick-slot auto-assign notices prefer Phaser text measurement at runtime, but the follow-up TODO remained broad. Two concrete gaps are visible in the current code: the shared notice clamp still re-measures the same glyphs repeatedly within one toast, and the inventory tooltip still clamps against a fixed `200px` width guess instead of its real rendered width.

**Approaches**

1. Keep the current runtime hook as-is
   Lowest risk, but it leaves repeated measurement work in the shared helper and keeps tooltip layout inaccurate near the right screen edge.

2. Add caching only
   Improves quick-slot notice efficiency, but it leaves another obvious text-measurement path on an outdated fixed-width assumption.

3. Pair notice-local caching with tooltip width-aware placement
   Recommended. Both changes stay scoped to the same inventory readability area, reuse the existing shared/browser split, and are small enough for one heartbeat.

**Chosen Design**

- Add a per-notice measurement cache to the shared quick-slot label clamp so repeated glyphs and repeated overwrite labels reuse the same measured width.
- Keep the cache optional and internal to the current notice build so Node regression checks remain deterministic and browser callers do not need a new API surface.
- Add a small shared helper to clamp inventory tooltip X positions from actual rendered width plus viewport width.
- In `InventoryScene`, factor tooltip display into a helper that sets text first, then clamps horizontal position from `this.tooltip.width` rather than a hard-coded width guess.
- Leave one narrower TODO active for deciding whether the same measurement pattern should expand to other HUD/prompt text paths or become a broader cache layer.

**Testing**

- Add a regression case proving a single overwrite notice measures a repeated glyph only once when Phaser-style measurement hooks are provided.
- Add a regression case for the new tooltip clamp helper and a source assertion showing `InventoryScene` uses `this.tooltip.width` with the shared clamp helper.
- Update README/help-overlay assertions to document the actual-width tooltip behavior.
