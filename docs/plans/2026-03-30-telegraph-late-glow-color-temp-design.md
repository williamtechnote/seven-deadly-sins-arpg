# Telegraph Late Glow Color Temperature Design

**Goal:** Let the final residual outer countdown-head glow read less warm during the last sub-millisecond tail beat so it stops competing with the true endpoint.

## Context

The Boss telegraph tail head already trims width, alpha, height, and corner radius across the last beats of an early-closing warning. The remaining artifact is color temperature: even after the outer glow gets smaller and dimmer, its warm hue still reads a touch hotter than the actual terminal marker on the last blink.

## Approaches

1. Cool only the residual outer late glow during the final sub-millisecond beat.
Recommended because it directly targets the remaining visual distraction without weakening the shell or inner core.

2. Cool both outer and inner late glows together.
This would be stronger, but it changes two layers at once and leaves less room for the next heartbeat follow-up.

3. Lower outer glow alpha again instead of changing color.
This overlaps with the previous alpha trim and risks making the tail cue disappear rather than just calm down.

## Design

- Add one shared summary flag for the final sub-millisecond outer-glow warmth trim.
- Reuse the existing final-width-trim beat so the new color-temperature change stacks with the already-shrunk silhouette.
- In the renderer, swap only the outer late glow to a cooler neutral cream when the new flag is true.
- Extend regression coverage for shared summary behavior, renderer source hooks, README wording, and help overlay wording.

## Testing

- Add a failing regression that keeps the new flag off at `remainingMs: 4`.
- Add a failing regression that flips the flag on at `remainingMs: 1`.
- Verify the renderer consumes the flag and switches the outer late-glow fill color.
