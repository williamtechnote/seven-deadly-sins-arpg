# Telegraph Tail Glow Trim Design

**Context**

The boss telegraph already exposes a warm countdown head marker, a short transition flash, a weaker late glow under the last ~220ms, and a tighter inner core under the last ~120ms. The remaining readability issue is the outer late glow: during the last instant of the tail-afterglow segment, it still blooms wide enough to compete with the head marker's exact endpoint.

**Goal**

When the live telegraph is already inside the tail-afterglow segment and the remaining countdown drops under about 80ms, shrink the weak outer glow so it hugs the head marker more tightly. This should preserve the existing pacing cues while reducing endpoint blur in the final beat.

**Chosen Approach**

Expose one extra shared-summary flag for the final-tail glow trim threshold. Keep the current warm flash, late glow activation, and inner-core focus thresholds unchanged. In the renderer, consume the new flag only in the late-glow branch and reduce the glow rectangles there.

**Why This Approach**

This keeps the behavior auditable in the shared HUD summary, gives regression checks a direct contract to validate, and avoids coupling the new 80ms trim to the existing 120ms inner-core focus threshold.

**Testing**

- Extend shared-summary regression checks with a final-tail case under 80ms.
- Extend rendering source assertions to verify the late-glow branch consumes the new trim flag and uses tighter geometry.
- Update README/help-overlay wording so player-facing docs stay aligned with the feature.
