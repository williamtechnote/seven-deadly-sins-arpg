# Quick-Slot Width-Weighted Clamp Design

**Context**

The current quick-slot fallback label clamp is based on a fixed three-glyph limit. That works for pure CJK labels, but it truncates mixed-width labels such as `HP恢复` too early because narrow Latin glyphs consume much less horizontal space than CJK glyphs in the HUD font.

**Approaches**

1. Keep the three-glyph clamp
   Lowest risk, but it leaves the active TODO unresolved and continues to over-truncate mixed-width labels.

2. Measure true canvas width in Phaser for every fallback label
   Most precise, but it couples a shared CLI/browser helper to runtime font measurement that does not exist in the Node regression environment.

3. Clamp by width-weight instead of raw glyph count
   Recommended. Keep the helper shared and deterministic by assigning narrow half-width glyphs a lower cost than CJK/full-width glyphs. This preserves current CJK examples like `圣疗秘…` while allowing mixed labels like `HP恢复` to stay intact.

**Chosen Design**

- Replace the fixed three-glyph clamp with a width-weighted clamp inside `shared/game-core.js`.
- Treat ASCII / half-width glyphs as narrow and CJK / full-width glyphs as wide.
- Keep the total width budget aligned with the current visual target so existing fully wide labels still clamp to three CJK characters plus ellipsis.
- Reuse the same helper for both non-overwrite and overwrite quick-slot notices.
- Leave a follow-up TODO for true Phaser text measurement only if the weighted heuristic still proves insufficient.

**Testing**

- Add regression coverage for mixed-width non-overwrite fallback labels, e.g. `快捷栏1：+HP恢复`.
- Add regression coverage for mixed-width overwrite fallback labels, e.g. `快捷栏2：HP恢复→ST恢复`.
- Update README and help-overlay assertions to document width-weighted clamping rather than pure character-count truncation.
